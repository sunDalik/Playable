import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums/enums";
import {closestPlayer} from "../../../utils/game_utils";
import {IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {randomAggressiveAI} from "../../../enemy_movement_ai";
import {Game} from "../../../game";

export class LunaticHorror extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["lunatic_horror.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.type = ENEMY_TYPE.LUNATIC_HORROR;
        this.atk = 1;
        this.currentTurnDelay = this.turnDelay = 1;
        this.tallModifier = Game.TILESIZE / 3;
        this.SLIDE_ANIMATION_TIME = 6;
    }

    move() {
        if (this.currentTurnDelay <= 0) {
            randomAggressiveAI(this, 99, false);
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
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        }
    }
}