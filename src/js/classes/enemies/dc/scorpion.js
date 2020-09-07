import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums/enums";
import {closestPlayer, closestPlayerDiagonal, tileDistanceDiagonal} from "../../../utils/game_utils";
import {DCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {randomDiagonalAggressiveAI} from "../../../enemy_movement_ai";
import {randomChoice} from "../../../utils/random_utils";

export class Scorpion extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["scorpion.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 1;
        this.name = "Scorpion";
        this.type = ENEMY_TYPE.SCORPION;
        this.atk = 1;
        this.noticeDistance = 4;
        this.currentTurnDelay = this.turnDelay = 2;
        this.shadowInside = true;
        this.shadowHeight = 7;
        this.regenerateShadow();
        this.scale.x *= randomChoice([-1, 1]);
    }

    move() {
        if (this.currentTurnDelay <= 0) {
            randomDiagonalAggressiveAI(this, this.noticeDistance);
            this.currentTurnDelay = this.turnDelay;
        } else this.currentTurnDelay--;
    }

    step(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.STEP_ANIMATION_TIME) {
        this.correctScale(tileStepX, tileStepY);
        super.step(tileStepX, tileStepY, onFrame, onEnd, animationTime);
    }

    bump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.BUMP_ANIMATION_TIME) {
        this.correctScale(tileStepX, tileStepY);
        super.bump(tileStepX, tileStepY, onFrame, onEnd, animationTime);
    }

    correctScale(tileStepX, tileStepY) {
        if ((tileStepX !== 0 && Math.sign(tileStepX) !== Math.sign(this.scale.x))
            || (tileStepX === 0 && tileStepY !== 0 && Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x) !== Math.sign(this.scale.x))) {
            this.scale.x *= -1;
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.currentTurnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else if (tileDistanceDiagonal(this, closestPlayerDiagonal(this), 1) <= this.noticeDistance) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }
}