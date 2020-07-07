import {Game} from "../../../game";
import {DAMAGE_TYPE, ENEMY_TYPE} from "../../../enums";
import {Boss} from "./boss";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {LunaticLeaderSpriteSheet} from "../../../loader";
import {isEmpty, tileInsideTheBossRoom} from "../../../map_checks";
import {darkenTile} from "../../../drawing/lighting";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {hypotenuse} from "../../../utils/math_utils";
import {createShadowFollowers} from "../../../animations";

export class LunaticLeader extends Boss {
    constructor(tilePositionX, tilePositionY, texture = LunaticLeaderSpriteSheet["lunatic_leader_neutral.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 18;
        this.type = ENEMY_TYPE.LUNATIC_LEADER;
        this.atk = 1.25;
        this.name = "Lunatic Leader";
        this.phases = 4;
        this.tallModifier = 7;
        this.setScaleModifier(1.7);
        this.shadowWidthMul = 0.35;
        this.regenerateShadow();
    }

    static getBossRoomStats() {
        return {width: randomInt(13, 16), height: randomInt(10, 12)};
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
        for (const enemy of Game.enemies) {
            if (enemy !== this) enemy.die(null);
        }
    }

    move() {
        if (Math.random() < 0.5) this.teleport();
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
        }
    }
}