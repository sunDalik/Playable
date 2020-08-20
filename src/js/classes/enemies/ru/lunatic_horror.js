import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums/enums";
import {getAngleForDirection} from "../../../utils/game_utils";
import {IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {Game} from "../../../game";
import {randomDiagonalAggressiveAI} from "../../../enemy_movement_ai";

export class LunaticHorror extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["lunatic_horror.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 1;
        this.name = "Lunatic Horror";
        this.type = ENEMY_TYPE.LUNATIC_HORROR;
        this.atk = 1;
        this.currentTurnDelay = this.turnDelay = 1;
        this.tallModifier = Game.TILESIZE / 3;
        this.SLIDE_ANIMATION_TIME = 6;
    }

    move() {
        if (this.currentTurnDelay <= 0) {
            randomDiagonalAggressiveAI(this, 99, false);
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
        this.angle = getAngleForDirection({x: Math.sign(tileStepX), y: Math.sign(tileStepY)});
        if (this.angle > 90) {
            this.scale.x = -1 * Math.abs(this.scale.x);
            this.angle += 180;
        } else {
            this.scale.x = Math.abs(this.scale.x);
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