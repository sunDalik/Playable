import {Game} from "../../../game";
import {ENEMY_TYPE} from "../../../enums/enums";
import {Boss} from "./boss";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {LunaticLeaderSpriteSheet} from "../../../loader";
import {getPlayerOnTile, isAnyWall, isEmpty, isNotAWall, tileInsideTheBossRoom} from "../../../map_checks";
import {darkenTile} from "../../../drawing/lighting";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {getBresenhamLine, hypotenuse} from "../../../utils/math_utils";
import {createShadowFollowers, fadeOutAndDie, runDestroyAnimation, shakeScreen} from "../../../animations";
import * as PIXI from "pixi.js";
import {BladeDemon} from "../ru/blade_demon";
import {LizardWarrior} from "../ru/lizard_warrior";
import {HexEye} from "../ru/hex_eye";
import {MudMage} from "../ru/mud_mage";
import {TeleportMage} from "../ru/teleport_mage";
import {DAMAGE_TYPE} from "../../../enums/damage_type";
import {DarkFireHazard} from "../../hazards/fire";
import {LunaticLeaderBullet} from "../bullets/lunatic_leader_bullet";
import {removeObjectFromArray} from "../../../utils/basic_utils";

export class LunaticLeader extends Boss {
    constructor(tilePositionX, tilePositionY, texture = LunaticLeaderSpriteSheet["lunatic_leader_neutral.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 18;
        this.type = ENEMY_TYPE.LUNATIC_LEADER;
        this.atk = 1.25;
        this.name = "Lunatic Leader";
        this.phases = 4;
        this.spawningMinions = false;
        this.teleporting = false;
        this.triggeredDarkFireAttack = false;
        this.triggeredWallSmashAttack = false;
        this.wallSmashClockwise = false;
        this.darkFireCounter = 0;
        this.wallSmashCounter = 0;
        this.wallSmashMaxTimes = 7;
        this.darkFireStage = 0; //0 if teleporting, 1 if releasing dark fire
        this.plannedMinions = [];
        this.minionSpawnDelay = 0;
        this.specialAttackDelay = 2;
        this.patience = {damage: 0, turns: 5};
        this.started = false;
        this.setMinionCount();
        this.tallModifier = 7;
        this.setScaleModifier(1.7);
        this.shadowWidthMul = 0.35;
        this.spiritFire = new PIXI.Sprite(LunaticLeaderSpriteSheet["lunatic_leader_blue_fire_separate.png"]);
        this.minions = [];
        this.bulletQueue = [];

        this.regenerateShadow();

        //guys don't look at me like that! I dunno it's just the z index for some reason is lower than needed if I don't call it
        this.correctZIndex();

        this.currentPhase = 2;
    }

    cancelAnimation() {
        super.cancelAnimation();
        if (this.currentPhase === 4 && !this.dead) this.animateSpirit();
    }

    static getBossRoomStats() {
        return {width: randomInt(14, 17), height: randomInt(10, 13)};
    }

    onBossModeActivate() {
        for (let x = 0; x < Game.map[0].length; x++) {
            for (let y = 0; y < Game.map.length; y++) {
                if (!tileInsideTheBossRoom(x, y)) {
                    darkenTile(x, y);
                }
            }
        }
    }

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        super.damage(source, dmg, inputX, inputY, damageType);
        if (this.currentPhase === 1 || this.currentPhase === 2) {
            this.patience.damage -= dmg;
            if (this.patience.damage <= 0) {
                this.patience.turns = 0;
            }
        } else if (this.currentPhase === 3) {
            this.throwAway(inputX, inputY);
        }
    }

    throwAway(throwX, throwY) {
        if (throwX !== 0 || throwY !== 0) {
            if (isEmpty(this.tilePosition.x + throwX, this.tilePosition.y + throwY)) {
                this.step(throwX, throwY);
                this.cancellable = false;
                return true;
            }
        }
        return false;
    }

    die(source) {
        super.die(source);
        if (this.dead) {
            Game.world.removeChild(this.spiritFire);
            for (let i = Game.enemies.length - 1; i >= 0; i--) {
                if (Game.enemies[i] !== this) Game.enemies[i].die(null);
            }
        }
    }

    move() {
        for (let i = this.bulletQueue.length - 1; i >= 0; i--) {
            const bullet = this.bulletQueue[i];
            bullet.delay--;
            if (bullet.delay <= 0) {
                bullet.delay = 1;
                Game.world.addBullet(bullet);
                removeObjectFromArray(bullet, this.bulletQueue);
            }
        }

        if (!this.started) {
            this.patience.turns--;
            if (this.patience.turns <= 0) {
                this.prepareToTeleport();
            }
            return;
        } else if (this.teleporting && (this.currentPhase === 1 || this.currentPhase === 2)) {
            this.teleport();
            this.setNeutralTexture();
            this.teleporting = false;
            this.updatePatience();
        } else if (this.triggeredDarkFireAttack && (this.currentPhase === 1 || this.currentPhase === 2)) {
            if (this.darkFireStage === 0) {
                this.teleport(true);
            } else {
                this.darkFire();
                this.darkFireCounter++;
            }
            this.darkFireStage = this.darkFireStage === 1 ? 0 : 1;
            if (this.darkFireCounter >= 3) {
                this.triggeredDarkFireAttack = false;
                this.setNeutralTexture();
                this.setSpecialAttackDelay();
            }
        } else if (this.triggeredWallSmashAttack && this.currentPhase === 2) {
            this.wallSmash();
            this.wallSmashCounter++;

            if (this.wallSmashCounter >= this.wallSmashMaxTimes) {
                this.triggeredWallSmashAttack = false;
                this.setNeutralTexture();
                this.setSpecialAttackDelay();
                this.prepareToTeleport();
            }
        } else if (this.spawningMinions && (this.currentPhase === 1 || this.currentPhase === 2)) {
            if (this.plannedMinions.length < this.minionCount) {
                const position = this.randomMinionSpawnLocation(this.plannedMinions);
                if (position === undefined) {
                    this.minionCount--;
                    return;
                }
                const minionArray = this.currentPhase === 2 ? [HexEye] : [BladeDemon, LizardWarrior, MudMage, TeleportMage];
                let minionType = randomChoice(minionArray);
                //reroll once if already has this minion
                if (this.plannedMinions.some(minion => minion.constructor === minionType)) minionType = randomChoice(minionArray);
                const minion = new minionType(position.x, position.y);
                minion.removeShadow();
                this.plannedMinions.push(minion);
                this.createMinionIllusion(minion);
            } else {
                for (const minion of this.plannedMinions) {
                    if (!isEmpty(minion.tilePosition.x, minion.tilePosition.y)) {
                        minion.die();
                        const player = getPlayerOnTile(minion.tilePosition.x, minion.tilePosition.y);
                        if (player) player.damage(1, minion, false, true);
                    } else {
                        minion.setShadow();
                        Game.world.addEnemy(minion);
                        this.minions.push(minion);
                    }
                }
                this.plannedMinions = [];
                this.setNeutralTexture();
                this.spawningMinions = false;
                this.minionSpawnDelay = randomInt(15, 20);
                this.setSpecialAttackDelay();
            }
        } else if (this.patience.turns <= 0) {
            this.prepareToTeleport();
        } else if (this.aliveMinionsCount() <= 1 && this.minionSpawnDelay <= 0 && (this.currentPhase === 1 || this.currentPhase === 2)) {
            this.spawningMinions = true;
            this.plannedMinions = [];
            this.setMinionCount();
            this.texture = LunaticLeaderSpriteSheet["lunatic_leader_eye_fire.png"];
        } else if (this.specialAttackDelay <= 0) {
            const random = Math.random() * 100;
            if (this.currentPhase === 1) {
                this.triggerDarkFire();
            } else {
                if (random < 0.30) {
                    this.triggerDarkFire();
                } else if (this.canPerformWallSmash) {
                    this.triggerWallSmashAttack();
                }
            }
        }

        this.specialAttackDelay--;
        this.minionSpawnDelay--;
        this.patience.turns--;
    }

    prepareToTeleport() {
        this.started = true;
        this.teleporting = true;
        this.texture = LunaticLeaderSpriteSheet["lunatic_leader_eye_fire.png"];
    }

    setSpecialAttackDelay() {
        this.specialAttackDelay = randomInt(9, 14);
    }

    triggerDarkFire() {
        this.triggeredDarkFireAttack = true;
        this.darkFireCounter = 0;
        this.darkFireStage = 0;
        this.texture = LunaticLeaderSpriteSheet["lunatic_leader_eye_fire.png"];
    }

    canPerformWallSmash() {
        const walls = [];
        for (let x = Game.endRoomBoundaries[0].x + 1; x < Game.endRoomBoundaries[1].x; x++) {
            if (isAnyWall(x, Game.endRoomBoundaries[0].y, true, false)) {
                walls.push({x: x, y: Game.endRoomBoundaries[0].y});
            }
            if (isAnyWall(x, Game.endRoomBoundaries[1].y, true, false)) {
                walls.push({x: x, y: Game.endRoomBoundaries[1].y});
            }
        }
        for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
            if (isAnyWall(Game.endRoomBoundaries[0].x, y, true, false)) {
                walls.push({x: Game.endRoomBoundaries[0].x, y: y});
            }

            if (isAnyWall(Game.endRoomBoundaries[1].x, y, true, false)) {
                walls.push({x: Game.endRoomBoundaries[1].x, y: y});
            }
        }
        return walls.length >= this.wallSmashMaxTimes;
    }

    triggerWallSmashAttack() {
        this.triggeredWallSmashAttack = true;
        this.wallSmashCounter = 0;
        this.wallSmashClockwise = randomChoice([false, true]);
        this.texture = LunaticLeaderSpriteSheet["lunatic_leader_eye_fire.png"];
    }

    setMinionCount() {
        this.minionCount = this.health < this.maxHealth / 2 ? 4 : 3;
        if (this.currentPhase === 2) this.minionCount--;
    }

    setNeutralTexture() {
        if (this.currentPhase === 1) this.texture = LunaticLeaderSpriteSheet["lunatic_leader_neutral.png"];
        else if (this.currentPhase === 2) this.texture = LunaticLeaderSpriteSheet["lunatic_leader_beakless.png"];
    }

    updatePatience() {
        this.patience.damage = randomInt(5, 8);
        this.patience.turns = randomInt(10, 20);
    }

    teleport(nearPlayers = false) {
        const teleportLocations = this.getFreeLocations(nearPlayers);
        if (teleportLocations.length === 0) return;
        const location = randomChoice(teleportLocations);
        this.shadowSlide(location.x - this.tilePosition.x, location.y - this.tilePosition.y);
    }

    darkFire() {
        const targetLocation = closestPlayer(this).tilePosition;
        for (const tile of getBresenhamLine(this.tilePosition.x, this.tilePosition.y, targetLocation.x, targetLocation.y)) {
            if (isNotAWall(tile.x, tile.y) && tile.x !== this.tilePosition.x || tile.y !== this.tilePosition.y) {
                const newFire = new DarkFireHazard(tile.x, tile.y);
                newFire.spreadTimes = 1;
                newFire.tileSpread = 1;
                newFire.LIFETIME = newFire.turnsLeft = 8;
                Game.world.addHazard(newFire);
            }
        }
    }

    wallSmash() {
        const plane = this.getWallSmashPlane();
        const wall = this.getRandomWallInPlane(plane);
        const endPos = {x: wall.x, y: wall.y};
        if (isAnyWall(wall.x, wall.y, true, false)) {
            if (plane.x !== 0) {
                endPos.x -= plane.x;
            } else if (plane.y !== 0) {
                endPos.y -= plane.y;
            }
            Game.world.removeTile(wall.x, wall.y);
            this.createBulletStream(wall.x, wall.y, [{x: -plane.x, y: -plane.y}]);
        }
        this.wallSmashSlide(endPos.x - this.tilePosition.x, endPos.y - this.tilePosition.y);
    }

    getWallSmashPlane() {
        if (this.tilePosition.y >= Game.endRoomBoundaries[1].y - 1) {
            return this.wallSmashClockwise ? {y: 0, x: -1} : {y: 0, x: 1};
        } else if (this.tilePosition.y <= Game.endRoomBoundaries[0].y + 1) {
            return this.wallSmashClockwise ? {y: 0, x: 1} : {y: 0, x: -1};
        } else if (this.tilePosition.x >= Game.endRoomBoundaries[1].x - 1) {
            return this.wallSmashClockwise ? {y: 1, x: 0} : {y: -1, x: 0};
        } else if (this.tilePosition.x <= Game.endRoomBoundaries[0].x + 1) {
            return this.wallSmashClockwise ? {y: -1, x: 0} : {y: 1, x: 0};
        } else {
            if (this.wallSmashClockwise) return randomChoice([{y: 1, x: 0}, {y: 0, x: -1}]);
            else return randomChoice([{y: -1, x: 0}, {y: 0, x: 1}]);
        }
    }

    getRandomWallInPlane(plane) {
        const walls = [];
        const antiWalls = [];
        if (plane.y !== 0) {
            let yInd = plane.y === -1 ? 0 : 1;
            for (let x = Game.endRoomBoundaries[0].x + 1; x < Game.endRoomBoundaries[1].x; x++) {
                const object = {x: x, y: Game.endRoomBoundaries[yInd].y};
                if (isAnyWall(x, Game.endRoomBoundaries[yInd].y, true, false)) {
                    walls.push(object);
                } else {
                    antiWalls.push(object);
                }

            }
        } else if (plane.x !== 0) {
            let xInd = plane.x === -1 ? 0 : 1;
            for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
                const object = {x: Game.endRoomBoundaries[xInd].x, y: y};
                if (isAnyWall(Game.endRoomBoundaries[xInd].x, y, true, false)) {
                    walls.push(object);
                } else {
                    antiWalls.push(object);
                }
            }
        }

        if (walls.length === 0) {
            return randomChoice(antiWalls);
        } else {
            return randomChoice(walls);
        }
    }

    createBulletStream(tileX, tileY, pattern) {
        Game.world.addBullet(new LunaticLeaderBullet(tileX, tileY, pattern));
        for (let n = 0; n < 9; n++) {
            const bullet = new LunaticLeaderBullet(tileX, tileY, pattern);
            bullet.delay = n;
            this.bulletQueue.push(bullet);
        }
    }

    getFreeLocations(nearPlayers = false) {
        const freeLocations = [];
        for (let i = Game.endRoomBoundaries[0].y + 1; i <= Game.endRoomBoundaries[1].y - 1; i++) {
            for (let j = Game.endRoomBoundaries[0].x + 1; j <= Game.endRoomBoundaries[1].x - 1; j++) {
                const newPos = {tilePosition: {x: j, y: i}};
                if (isEmpty(j, i) && tileDistance(this, newPos) > 5 && tileDistance(newPos, closestPlayer(newPos)) > 3) {
                    if (!nearPlayers || tileDistance(newPos, closestPlayer(newPos)) < 6) {
                        freeLocations.push({x: j, y: i});
                    }
                }
            }
        }
        return freeLocations;
    }

    randomMinionSpawnLocation(previousLocations = []) {
        const goodLocations = [];
        for (let i = Game.endRoomBoundaries[0].y + 1; i <= Game.endRoomBoundaries[1].y - 1; i++) {
            for (let j = Game.endRoomBoundaries[0].x + 1; j <= Game.endRoomBoundaries[1].x - 1; j++) {
                const location = {tilePosition: {x: j, y: i}};
                if (tileDistance(this, location) > 1 && isEmpty(j, i) && tileDistance(location, closestPlayer(location)) > 2
                    && previousLocations.every(prevLoc => tileDistance(prevLoc, location) > 4)) {
                    goodLocations.push({x: j, y: i});
                }
            }
        }
        return randomChoice(goodLocations);
    }

    createMinionIllusion(minion) {
        const illusion = new PIXI.Sprite(minion.texture);
        illusion.anchor.set(0.5, 0.5);
        illusion.scale.set(minion.scale.x, minion.scale.y);
        illusion.position.set(minion.position.x, minion.position.y);
        illusion.zIndex = minion.zIndex;
        Game.world.addChild(illusion);
        fadeOutAndDie(illusion, false, 15);
    }

    wallSmashSlide(tileStepX, tileStepY) {
        this.removeShadow();
        const animationTime = hypotenuse(tileStepX, tileStepY) * 0.8;
        this.slide(tileStepX, tileStepY, null, () => {
            this.setShadow();
            shakeScreen();
        }, animationTime);
    }

    shadowSlide(tileStepX, tileStepY) {
        //shadow is turned off during slides because shadow implementation is buggy!!!
        this.removeShadow();
        const animationTime = hypotenuse(tileStepX, tileStepY) * 1.1;
        createShadowFollowers(this, 3, animationTime);
        this.slide(tileStepX, tileStepY, null, () => this.setShadow(), animationTime);
    }

    getPhaseHealth(phase) {
        if (phase === 2) return 25;
        else if (phase === 3) return 6;
        else if (phase === 4) return 30;
    }

    changePhase(newPhase) {
        if (newPhase === 2) {
            this.texture = LunaticLeaderSpriteSheet["lunatic_leader_beakless.png"];
        } else if (newPhase === 3) {
            this.texture = LunaticLeaderSpriteSheet["lunatic_leader_headless.png"];
        } else if (newPhase === 4) {
            runDestroyAnimation(this);
            this.texture = LunaticLeaderSpriteSheet["lunatic_leader_spirit.png"];
            this.angle = randomInt(0, 360);
            this.initSpirit();
        }

        //this will reset any minion spawning
        this.minionCount = 0;
    }

    initSpirit() {
        Game.world.addChild(this.spiritFire);
        this.spiritFire.anchor.set(0.5, 0.85);
        this.spiritFire.zIndex = this.zIndex + 1;
        this.spiritFire.scale.set(this.scale.x * 1.3, this.scale.y * 1.3);
        this.place();
        this.spiritFire.position.set(this.position.x, this.position.y);
        this.animateSpirit();
    }

    animateSpirit() {
        const angleChange = 0.5;
        const animation = delta => {
            this.angle += angleChange * delta;
            this.spiritFire.angle += randomInt(-0.5, 0.5);
            if (Math.abs(this.spiritFire.angle) > 6) this.spiritFire.angle = 6 * Math.sign(this.spiritFire.angle);
        };

        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    aliveMinionsCount() {
        this.minions = this.minions.filter(minion => !minion.dead);
        return this.minions.length;
    }
}