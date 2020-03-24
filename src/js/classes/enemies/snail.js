import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {PoisonHazard} from "../hazards/poison";
import {getPlayerOnTile, isAnyWall, isInanimate} from "../../map_checks";
import {closestPlayer, tileDistance} from "../../utils/game_utils";
import {getChasingOptions, getRelativelyEmptyLitCardinalDirections} from "../../utils/map_utils";
import {randomChoice} from "../../utils/random_utils";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../loader";

export class Snail extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["snail.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SNAIL;
        this.atk = 1;
        this.turnDelay = 1;
        this.currentTurnDelay = this.turnDelay;
        this.noticeDistance = 5;
        this.scaleModifier = 0.8;
        this.fitToTile();
    }

    afterMapGen() {
        if (isAnyWall(this.tilePosition.x + 1, this.tilePosition.y)
            || isInanimate(this.tilePosition.x + 1, this.tilePosition.y)) {
            this.scale.x *= -1;
        }
    }

    move() {
        if (this.currentTurnDelay === 0) {
            if (tileDistance(this, closestPlayer(this)) <= this.noticeDistance) {
                const movementOptions = getChasingOptions(this, closestPlayer(this));
                if (movementOptions.length !== 0) {
                    const dir = randomChoice(movementOptions);
                    const player = getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
                    if (player) {
                        this.slideBump(dir.x, dir.y);
                        player.damage(this.atk, this, true);
                    } else {
                        Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y));
                        this.slide(dir.x, dir.y);
                    }
                } else this.slideBump(Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x), Math.sign(closestPlayer(this).tilePosition.y - this.tilePosition.y));
            } else {
                const movementOptions = getRelativelyEmptyLitCardinalDirections(this);
                if (movementOptions.length !== 0) {
                    const dir = randomChoice(movementOptions);
                    Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y));
                    this.slide(dir.x, dir.y);
                }
            }
            this.currentTurnDelay = this.turnDelay;
        } else this.currentTurnDelay--;
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        this.correctScale(tileStepX, tileStepY);
        super.slide(tileStepX, tileStepY, onFrame, onEnd, animationTime);
    }

    slideBump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        this.correctScale(tileStepX, tileStepY);
        super.slideBump(tileStepX, tileStepY, onFrame, onEnd, animationTime);
    }

    correctScale(tileStepX, tileStepY) {
        if (tileStepX !== 0 && Math.sign(tileStepX) !== Math.sign(this.scale.x)
            || tileStepY !== 0 && Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x) !== Math.sign(this.scale.x)) {
            this.scale.x *= -1;
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.currentTurnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else if (tileDistance(this, closestPlayer(this)) <= this.noticeDistance) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }
}