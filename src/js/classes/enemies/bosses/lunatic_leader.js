import {Game} from "../../../game";
import {DAMAGE_TYPE, ENEMY_TYPE} from "../../../enums";
import {Boss} from "./boss";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {LunaticLeaderSpriteSheet} from "../../../loader";
import {getPlayerOnTile, isEmpty, tileInsideTheBossRoom} from "../../../map_checks";
import {darkenTile} from "../../../drawing/lighting";
import {closestPlayer, otherPlayer, tileDistance} from "../../../utils/game_utils";
import {hypotenuse} from "../../../utils/math_utils";
import {createShadowFollowers, fadeOutAndDie, runDestroyAnimation} from "../../../animations";
import * as PIXI from "pixi.js";
import {BladeDemon} from "../ru/blade_demon";
import {LizardWarrior} from "../ru/lizard_warrior";
import {HexEye} from "../ru/hex_eye";

export class LunaticLeader extends Boss {
    constructor(tilePositionX, tilePositionY, texture = LunaticLeaderSpriteSheet["lunatic_leader_neutral.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 18;
        this.type = ENEMY_TYPE.LUNATIC_LEADER;
        this.atk = 1.25;
        this.name = "Lunatic Leader";
        this.phases = 4;
        this.spawningMinions = false;
        this.plannedMinions = [];
        this.minionSpawnDelay = 3;
        this.setMinionCount();
        this.tallModifier = 7;
        this.setScaleModifier(1.7);
        this.shadowWidthMul = 0.35;
        this.spiritFire = new PIXI.Sprite(LunaticLeaderSpriteSheet["lunatic_leader_blue_fire_separate.png"]);
        this.minions = [];

        this.regenerateShadow();
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

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL) {
        super.damage(source, dmg, inputX, inputY, damageType);
        if (this.currentPhase === 3) {
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
            for (const enemy of Game.enemies) {
                if (enemy !== this) enemy.die(null);
            }
        }
    }

    move() {
        if (this.currentPhase === 1 || this.currentPhase === 2) {
            if (this.spawningMinions) {
                if (this.plannedMinions.length < this.minionCount) {
                    const position = this.randomMinionSpawnLocation(this.plannedMinions);
                    if (position === undefined) {
                        this.minionCount--;
                        return;
                    }
                    const minionType = this.currentPhase === 2 ? HexEye : randomChoice([BladeDemon, LizardWarrior]);
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
                    this.texture = LunaticLeaderSpriteSheet["lunatic_leader_neutral.png"];
                    this.spawningMinions = false;
                    this.minionSpawnDelay = randomInt(15, 20);
                }
            } else if (this.aliveMinionsCount() <= 1 && this.minionSpawnDelay <= 0) {
                this.spawningMinions = true;
                this.plannedMinions = [];
                this.setMinionCount();
                this.texture = LunaticLeaderSpriteSheet["lunatic_leader_eye_fire.png"];
            }
        } else if (this.currentPhase === 2) {

        } else if (this.currentPhase === 4) {

        }

        this.minionSpawnDelay--;
        //if (Math.random() < 0.5) this.teleport();
    }

    setMinionCount() {
        this.minionCount = this.health < this.maxHealth / 2 ? 4 : 3;
    }

    teleport() {
        const teleportLocations = this.getFreeLocations();
        if (teleportLocations.length === 0) return;
        const location = randomChoice(teleportLocations);
        this.shadowSlide(location.x - this.tilePosition.x, location.y - this.tilePosition.y);
    }

    getFreeLocations() {
        const freeLocations = [];
        for (let i = Game.endRoomBoundaries[0].y + 1; i <= Game.endRoomBoundaries[1].y - 1; i++) {
            for (let j = Game.endRoomBoundaries[0].x + 1; j <= Game.endRoomBoundaries[1].x - 1; j++) {
                const newPos = {tilePosition: {x: j, y: i}};
                if (tileDistance(this, newPos) > 5 && isEmpty(j, i) && tileDistance(newPos, closestPlayer(newPos)) > 3) {
                    freeLocations.push({x: j, y: i});
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