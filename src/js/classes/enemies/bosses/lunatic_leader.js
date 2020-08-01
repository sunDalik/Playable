import {Game} from "../../../game";
import {ENEMY_TYPE} from "../../../enums/enums";
import {Boss} from "./boss";
import {randomChoice, randomInt, randomShuffle, weightedRandomChoice} from "../../../utils/random_utils";
import {LunaticLeaderSpriteSheet} from "../../../loader";
import {
    getPlayerOnTile,
    isAnyWall,
    isEmpty,
    isEnemy,
    isNotAWall,
    isOutOfMap,
    isRelativelyEmpty,
    tileInsideTheBossRoom
} from "../../../map_checks";
import {darkenTile} from "../../../drawing/lighting";
import {closestPlayer, tileDistance, tileDistanceDiagonal} from "../../../utils/game_utils";
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
import {LunaticHorror} from "../ru/lunatic_horror";
import {Enemy} from "../enemy";
import {get8Directions, getCardinalDirections} from "../../../utils/map_utils";
import {HomingBullet} from "../bullets/homing";
import {TileElement} from "../../tile_elements/tile_element";

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
        this.triggeredLunaticHorrorSpawn = false;
        this.triggeredCenterTeleport = false;
        this.triggeredSpiritSplit = false;
        this.spiritCentered = false;
        this.horrors = [];
        this.spiritClones = [];
        this.shakeWaiting = false;
        this.lunaticHorrorCounter = 0;
        this.wallSmashClockwise = false;
        this.darkFireCounter = 0;
        this.triggeredSpiritShooting = false;
        this.spiritShootDelay = 0;
        this.wallSmashCounter = 0;
        this.wallSmashMaxTimes = 6;
        this.spiritSplitTimes = 0;
        this.darkFireStage = 0; //0 if teleporting, 1 if releasing dark fire
        this.plannedMinions = [];
        this.minionSpawnDelay = 0;
        this.specialAttackDelay = 2;
        this.damagePatience = 0;
        this.forbidDarkFire = false;
        this.forbidHorrorSpawning = false;
        this.forbidWallSmashing = false;
        this.thrown = false;
        this.started = false;
        this.startDelay = 5;
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
    }

    place() {
        super.place();
        if (this.currentPhase === 4) this.spiritFire.position.set(this.position.x, this.position.y);
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
        const lastPhase = this.currentPhase;
        super.damage(source, dmg, inputX, inputY, damageType);
        this.startDelay = -1;
        if (this.currentPhase === 1 || this.currentPhase === 2) {
            this.damagePatience -= dmg;
        }
        if (this.currentPhase === 3 || (this.currentPhase === 2 && lastPhase === 1)) {
            this.throwAway(inputX, inputY);
        } else if (this.currentPhase === 4 && this.currentPhase === lastPhase) {
            if (this.spiritCentered) {
                this.triggeredSpiritSplit = true;
            } else if (this.spiritSplitTimes === 0
                || (this.spiritSplitTimes === 1 && this.health <= this.maxHealth * 2 / 3)
                || (this.spiritSplitTimes === 2 && this.health <= this.maxHealth / 3)) {
                if (!this.triggeredCenterTeleport) {
                    this.triggeredCenterTeleport = true;
                }
            }
        }
    }

    throwAway(throwX, throwY) {
        if (throwX !== 0 || throwY !== 0) {
            if (isEmpty(this.tilePosition.x + throwX, this.tilePosition.y + throwY)) {
                this.step(throwX, throwY);
                this.cancellable = false;
                return true;
            } else {
                this.bump(throwX, throwY);
            }
            this.thrown = true;
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
            for (let i = Game.bullets.length - 1; i >= 0; i--) {
                if (!Game.bullets[i].dead) Game.bullets[i].die();
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
            this.startDelay--;
            if (this.startDelay <= 0) {
                this.prepareToTeleport();
            }
            return;
        } else if (this.shakeWaiting) {
            this.shake(1, 0);
            this.shakeWaiting = false;
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
                this.forbidDarkFire = true;
            }
        } else if (this.triggeredWallSmashAttack && this.currentPhase === 2) {
            this.wallSmash();
            this.wallSmashCounter++;

            if (this.wallSmashCounter >= this.wallSmashMaxTimes) {
                this.triggeredWallSmashAttack = false;
                this.setNeutralTexture();
                this.setSpecialAttackDelay();
                this.prepareToTeleport();
                this.forbidWallSmashing = true;
            }
        } else if (this.triggeredLunaticHorrorSpawn && this.currentPhase === 2) {
            this.spawnHorror();
            this.lunaticHorrorCounter--;
            if (this.lunaticHorrorCounter <= 0) {
                this.triggeredLunaticHorrorSpawn = false;
                this.setNeutralTexture();
                this.setSpecialAttackDelay();
                this.forbidHorrorSpawning = true;
            } else {
                this.shake(1, 0);
            }
        } else if (this.spawningMinions && (this.currentPhase === 1 || this.currentPhase === 2)) {
            if (this.plannedMinions.length < this.minionCount) {
                const position = this.randomMinionSpawnLocation(this.plannedMinions);
                if (position === undefined) {
                    this.minionCount--;
                    return;
                }
                const minionArray = this.currentPhase === 2 ? [HexEye, HexEye, BladeDemon, LizardWarrior, MudMage, TeleportMage] : [BladeDemon, LizardWarrior, MudMage, TeleportMage];
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
                this.minionSpawnDelay = randomInt(25, 30);
                this.setSpecialAttackDelay();
            }
        } else if (this.triggeredCenterTeleport) {
            this.centerSpirit();
            this.spiritCentered = true;
            this.triggeredCenterTeleport = false;
        } else if (this.triggeredSpiritSplit) {
            this.spiritSplit();
            this.spiritCentered = false;
            this.triggeredSpiritSplit = false;
            this.spiritSplitTimes++;
        } else if (this.damagePatience <= 0 && (this.currentPhase === 1 || this.currentPhase === 2) && !this.thrown) {
            this.prepareToTeleport();
        } else if (this.canSpawnMinions() && this.minionSpawnDelay <= 0 && !this.thrown) {
            this.spawningMinions = true;
            this.plannedMinions = [];
            this.setMinionCount();
            this.setEyeFireTexture();
        } else if (this.specialAttackDelay <= 0 && (this.currentPhase === 1 || this.currentPhase === 2) && !this.thrown) {
            if (this.currentPhase === 1) {
                this.triggerDarkFire();
            } else {
                const attackList = [{item: 1, weight: 1}, {item: 2, weight: 2}, {item: 3, weight: 2}];
                if (this.forbidDarkFire) attackList[0].weight = 0;
                else if (this.forbidWallSmashing) attackList[1].weight = 0;
                else if (this.forbidHorrorSpawning) attackList[2].weight = 0;
                const attack = weightedRandomChoice(attackList);
                if (attack === 1) {
                    this.triggerDarkFire();
                    this.liftAttackForbiddances();
                } else if (attack === 2) {
                    if (this.canPerformWallSmash()) {
                        this.triggerWallSmashAttack();
                        this.liftAttackForbiddances();
                    } else this.forbidDarkFire = false;
                } else if (attack === 3) {
                    if (this.canSpawnHorrors()) {
                        this.triggerLunaticHorrorSpawn();
                        this.liftAttackForbiddances();
                    } else this.forbidDarkFire = false;
                }
            }
        } else if (this.currentPhase === 4) {
            this.spiritMoveLogic(this);
        }

        this.specialAttackDelay--;
        this.minionSpawnDelay--;
        this.thrown = false;
    }

    prepareToTeleport() {
        this.started = true;
        this.teleporting = true;
        this.setEyeFireTexture();
    }

    setSpecialAttackDelay() {
        this.specialAttackDelay = randomInt(14, 20);
    }

    liftAttackForbiddances() {
        this.forbidDarkFire = false;
        this.forbidHorrorSpawning = false;
        this.forbidWallSmashing = false;
    }

    triggerDarkFire() {
        this.triggeredDarkFireAttack = true;
        this.darkFireCounter = 0;
        this.darkFireStage = 0;
        this.shake(1, 0);
        this.shakeWaiting = true;
        if (this.currentPhase === 1) this.texture = LunaticLeaderSpriteSheet["lunatic_leader_eye_dark_fire.png"];
        else if (this.currentPhase === 2) this.texture = LunaticLeaderSpriteSheet["lunatic_leader_beakless_dark_fire.png"];
    }

    triggerLunaticHorrorSpawn() {
        this.triggeredLunaticHorrorSpawn = true;
        this.shake(1, 0);
        this.shakeWaiting = true;
        this.lunaticHorrorCounter = randomInt(3, 6);
        this.texture = LunaticLeaderSpriteSheet["lunatic_leader_about_to_spawn_horrors.png"];
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

    canSpawnMinions() {
        if (this.currentPhase === 1) {
            if (this.health >= this.maxHealth / 2) {
                return this.aliveMinionsCount() <= 1;
            } else {
                return this.aliveMinionsCount() <= 2;
            }
        } else if (this.currentPhase === 2) {
            return this.aliveMinionsCount() <= 2;
        } else {
            return false;
        }
    }

    triggerWallSmashAttack() {
        this.triggeredWallSmashAttack = true;
        this.wallSmashCounter = 0;
        this.shake(1, 0);
        this.shakeWaiting = true;
        this.wallSmashClockwise = randomChoice([false, true]);
        this.texture = LunaticLeaderSpriteSheet["lunatic_leader_wall_smash.png"];
    }

    setMinionCount() {
        if (this.currentPhase === 1) this.minionCount = 3;
        else if (this.currentPhase === 2) this.minionCount = 2;
    }

    setNeutralTexture() {
        if (this.currentPhase === 1) this.texture = LunaticLeaderSpriteSheet["lunatic_leader_neutral.png"];
        else if (this.currentPhase === 2) this.texture = LunaticLeaderSpriteSheet["lunatic_leader_beakless.png"];
        else if (this.currentPhase === 3) this.texture = LunaticLeaderSpriteSheet["lunatic_leader_headless.png"];
        else if (this.currentPhase === 4) this.texture = LunaticLeaderSpriteSheet["lunatic_leader_spirit.png"];
    }

    setEyeFireTexture() {
        if (this.currentPhase === 1) this.texture = LunaticLeaderSpriteSheet["lunatic_leader_eye_fire.png"];
        else if (this.currentPhase === 2) this.texture = LunaticLeaderSpriteSheet["lunatic_leader_beakless_eye_fire.png"];
    }

    updatePatience() {
        this.damagePatience = randomInt(4, 7);
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
                newFire.tileSpread = randomInt(0, 1);
                newFire.LIFETIME = newFire.turnsLeft = 8;
                Game.world.addHazard(newFire);
            }
        }
    }

    wallSmash() {
        const plane = this.getWallSmashPlane();
        const wall = this.getRandomWallInPlane(plane);
        if (wall === undefined) return;
        const endPos = {x: wall.x, y: wall.y};
        let createBulletStream = false;
        if (isAnyWall(wall.x, wall.y, true, false)) {
            endPos.x -= plane.x;
            endPos.y -= plane.y;
            Game.world.removeTile(wall.x, wall.y);
            createBulletStream = true;
        }

        if (isEnemy(endPos.x, endPos.y)) {
            const enemy = Game.map[endPos.y][endPos.x].entity;
            if (enemy !== this) enemy.die();
        }
        const player = getPlayerOnTile(endPos.x, endPos.y);
        if (player) {
            endPos.x += plane.x;
            endPos.y += plane.y;
        }
        this.wallSmashSlide(endPos.x - this.tilePosition.x, endPos.y - this.tilePosition.y);
        if (createBulletStream) this.createBulletStream(wall.x, wall.y, [{x: -plane.x, y: -plane.y}]);
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
                } else if (isEmpty(x, Game.endRoomBoundaries[yInd].y)) {
                    antiWalls.push(object);
                }
            }
        } else if (plane.x !== 0) {
            let xInd = plane.x === -1 ? 0 : 1;
            for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
                const object = {x: Game.endRoomBoundaries[xInd].x, y: y};
                if (isAnyWall(Game.endRoomBoundaries[xInd].x, y, true, false)) {
                    walls.push(object);
                } else if (isEmpty(Game.endRoomBoundaries[xInd].x, y)) {
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
        const animationTime = hypotenuse(tileStepX, tileStepY) * 0.8;
        this.slide(tileStepX, tileStepY, null, () => {
            shakeScreen();
        }, animationTime);
    }

    shadowSlide(tileStepX, tileStepY) {
        const animationTime = hypotenuse(tileStepX, tileStepY) * 1.1;
        createShadowFollowers(this, 3, animationTime);
        this.slide(tileStepX, tileStepY, null, null, animationTime);
    }

    canSpawnHorrors() {
        this.horrors = this.horrors.filter(h => !h.dead);
        return this.horrors.length < 4;
    }

    spawnHorror() {
        this.texture = LunaticLeaderSpriteSheet["lunatic_leader_spawning_horrors.png"];
        const tile = this.getRandomHorrorSpawnTile();
        if (tile === undefined) return;
        const yTile = isOutOfMap(this.tilePosition.x, this.tilePosition.y - 2) ? this.tilePosition.y - 1 : this.tilePosition.y - 2;
        const horror = new LunaticHorror(this.tilePosition.x, yTile);
        Game.world.addEnemy(horror);
        this.horrors.push(horror);
        horror.setStun(1);
        horror.slide(tile.x - this.tilePosition.x, tile.y - yTile, null, null,
            tileDistanceDiagonal(this, {tilePosition: {x: tile.x, y: tile.y}}) + 2);
    }

    getRandomHorrorSpawnTile() {
        const tiles = [];
        for (let x = Game.endRoomBoundaries[0].x; x <= Game.endRoomBoundaries[1].x; x++) {
            for (let y = Game.endRoomBoundaries[0].y; y <= Game.endRoomBoundaries[1].y; y++) {
                if (tileDistance(this, {tilePosition: {x: x, y: y}}) < 6
                    && tileDistance(this, {tilePosition: {x: x, y: y}}) > 1
                    && isRelativelyEmpty(x, y) && getPlayerOnTile(x, y) === null) {
                    tiles.push({x: x, y: y});
                }
            }
        }
        return randomChoice(tiles);
    }

    getPhaseHealth(phase) {
        if (phase === 2) return 24;
        else if (phase === 3) return 6;
        else if (phase === 4) return 30;
    }

    changePhase(newPhase) {
        if (newPhase === 2) {
            this.texture = LunaticLeaderSpriteSheet["lunatic_leader_beakless.png"];
            this.destroyBeak();
        } else if (newPhase === 3) {
            this.texture = LunaticLeaderSpriteSheet["lunatic_leader_headless.png"];
            this.destroyHead();
        } else if (newPhase === 4) {
            runDestroyAnimation(this);
            this.texture = LunaticLeaderSpriteSheet["lunatic_leader_spirit.png"];
            this.angle = randomInt(0, 360);
            this.initSpirit();
        }

        //this will reset any special attacks
        this.darkFireCounter = 99;
        this.minionCount = 0;
        this.shakeWaiting = false;
        this.teleporting = false;
    }

    destroyBeak() {
        const beak = new TileElement(LunaticLeaderSpriteSheet["lunatic_leader_beak.png"], this.tilePosition.x, this.tilePosition.y);
        beak.setScaleModifier(this.scaleModifier);
        beak.zIndex = this.zIndex + 1;
        beak.tallModifier = Game.TILESIZE * 0.9;
        beak.place();
        runDestroyAnimation(beak, false, 0, 1);
    }

    destroyHead() {
        const head = new TileElement(LunaticLeaderSpriteSheet["lunatic_leader_beakless_head.png"], this.tilePosition.x, this.tilePosition.y);
        head.setScaleModifier(this.scaleModifier);
        head.zIndex = this.zIndex + 1;
        head.tallModifier = Game.TILESIZE * 0.75;
        head.place();
        runDestroyAnimation(head, false, 0, 1);
    }

    initSpirit() {
        Game.world.addChild(this.spiritFire);
        this.angle = randomInt(0, 360);
        this.spiritFire.anchor.set(0.5, 0.85);
        this.spiritFire.zIndex = this.zIndex + 1;
        this.spiritFire.scale.set(this.scale.x * 1.3, this.scale.y * 1.3);
        this.place();
        this.spiritFire.position.set(this.position.x, this.position.y);
        this.animateSpirit();
        this.spiritCentered = true;
        this.spiritShootDelay = this.getInitSpiritShootDelay(0);
    }

    centerSpirit() {
        this.teleport();
        for (const spirit of this.spiritClones) {
            if (!spirit.dead) {
                spirit.die();
            }
        }
        this.spiritClones = [];
    }

    spiritSplit() {
        this.texture = LunaticLeaderSpriteSheet["lunatic_leader_spirit.png"];
        this.spiritFire.texture = LunaticLeaderSpriteSheet["lunatic_leader_blue_fire_separate.png"];
        this.spiritClones = [];
        for (let i = 0; i < 3; i++) {
            const spiritClone = new SpiritClone(this.tilePosition.x, this.tilePosition.y, this);
            Game.world.addEnemy(spiritClone);
            this.spiritClones.push(spiritClone);
        }
        const tiles = [{x: Game.endRoomBoundaries[0].x + 2, y: Game.endRoomBoundaries[0].y + 2},
            {x: Game.endRoomBoundaries[1].x - 2, y: Game.endRoomBoundaries[0].y + 2},
            {x: Game.endRoomBoundaries[0].x + 2, y: Game.endRoomBoundaries[1].y - 2},
            {x: Game.endRoomBoundaries[1].x - 2, y: Game.endRoomBoundaries[1].y - 2}];

        // pick random corner tiles without players on it
        for (const tile of tiles) {
            for (const dir of randomShuffle(get8Directions().concat([{x: 0, y: 0}]))) {
                if (getPlayerOnTile(tile.x + dir.x, tile.y + dir.y) === null) {
                    tile.x += dir.x;
                    tile.y += dir.y;
                    break;
                }
            }
        }

        const spirits = randomShuffle(this.spiritClones.concat([this]));
        randomShuffle(tiles);
        for (let i = 0; i < tiles.length; i++) {
            if (isEnemy(tiles[i].x, tiles[i].y)) {
                const enemy = Game.map[tiles[i].y][tiles[i].x].entity;
                if (enemy !== this && enemy.type !== ENEMY_TYPE.LUNATIC_LEADER_SPIRIT_CLONE) enemy.die();
            }
            spirits[i].slide(tiles[i].x - spirits[i].tilePosition.x, tiles[i].y - spirits[i].tilePosition.y, null, null,
                tileDistance({tilePosition: tiles[i]}, spirits[i]) * 1.2);
            spirits[i].spiritShootDelay = this.getInitSpiritShootDelay(i);
        }
    }

    animateSpirit() {
        const angleChange = 0.5;
        const animation = delta => {
            this.angle += angleChange * delta;
            this.spiritFire.angle += randomInt(-0.5, 0.5);
            if (Math.abs(this.spiritFire.angle) > 6) this.spiritFire.angle = 6 * Math.sign(this.spiritFire.angle);
            if (this.animation !== animation) {
                Game.app.ticker.remove(animation);
            }
        };

        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    aliveMinionsCount() {
        this.minions = this.minions.filter(minion => !minion.dead);
        return this.minions.length;
    }

    getRandomSpiritShootDelay() {
        return randomInt(10, 14);
    }

    getInitSpiritShootDelay(order) {
        return 2 + order * 2;
    }

    spiritMoveLogic(spirit) {
        if (spirit.triggeredSpiritShooting) {
            for (const dir of getCardinalDirections()) {
                if (isEmpty(spirit.tilePosition.x + dir.x, spirit.tilePosition.y + dir.y)) {
                    const bullet = new HomingBullet(spirit.tilePosition.x + dir.x, spirit.tilePosition.y + dir.y);
                    Game.world.addBullet(bullet);
                }
            }
            spirit.texture = LunaticLeaderSpriteSheet["lunatic_leader_spirit.png"];
            spirit.spiritFire.texture = LunaticLeaderSpriteSheet["lunatic_leader_blue_fire_separate.png"];
            spirit.triggeredSpiritShooting = false;
            spirit.spiritShootDelay = this.getRandomSpiritShootDelay();
        } else if (spirit.spiritShootDelay <= 0) {
            spirit.triggeredSpiritShooting = true;
            spirit.texture = LunaticLeaderSpriteSheet["lunatic_leader_spirit_homing.png"];
            spirit.spiritFire.texture = LunaticLeaderSpriteSheet["lunatic_leader_homing_fire_separate.png"];
        } else {
            spirit.spiritShootDelay--;
        }
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        //shadow is turned off during slides because shadow implementation is buggy!!!
        this.removeShadow();
        if (this.currentPhase === 4) {
            super.slide(tileStepX, tileStepY, () => {
                if (onFrame) onFrame();
                this.spiritFire.position.set(this.position.x, this.position.y);
                this.spiritFire.zIndex = this.zIndex + 1;
            }, () => {
                if (onEnd) onEnd();
                this.setShadow();
                this.animateSpirit();
            }, animationTime);
        } else {
            super.slide(tileStepX, tileStepY, onFrame, () => {
                if (onEnd) onEnd();
                this.setShadow();
            }, animationTime);
        }
    }
}

class SpiritClone extends Enemy {
    constructor(tilePositionX, tilePositionY, master, texture = LunaticLeaderSpriteSheet["lunatic_leader_spirit.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 0.25;
        this.type = ENEMY_TYPE.LUNATIC_LEADER_SPIRIT_CLONE;
        this.fadingDestructionParticles = true;
        this.master = master;
        this.currentPhase = 4;
        this.tallModifier = master.tallModifier;
        this.place();
        this.scale.set(master.scale.x, master.scale.y);
        this.triggeredSpiritShooting = false;
        this.spiritFire = new PIXI.Sprite(LunaticLeaderSpriteSheet["lunatic_leader_blue_fire_separate.png"]);
        this.master.initSpirit.call(this);
        this.anchor.set(master.anchor.x, master.anchor.y);
    }

    cancelAnimation() {
        super.cancelAnimation();
        if (this.spiritFire) this.animateSpirit();
    }

    place() {
        super.place();
        if (this.spiritFire) this.spiritFire.position.set(this.position.x, this.position.y);
    }

    setStun(stun) {
        return false;
    }

    updateIntentIcon() {
        this.intentIcon.visible = false;
        return false;
    }

    setStunIcon() {
        this.intentIcon.visible = false;
        return false;
    }

    move() {
        this.master.spiritMoveLogic(this);
    }

    animateSpirit() {
        this.master.animateSpirit.call(this);
    }

    getInitSpiritShootDelay() {
        this.master.getInitSpiritShootDelay();
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        this.master.slide.call(this, tileStepX, tileStepY, onFrame, onEnd, animationTime);
    }

    die(source) {
        super.die(source);
        Game.world.removeChild(this.spiritFire);
    }
}