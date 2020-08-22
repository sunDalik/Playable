import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums/enums";
import {DTEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {Game} from "../../../game";
import {DAMAGE_TYPE} from "../../../enums/damage_type";
import {randomAggressiveAI} from "../../../enemy_movement_ai";
import {updateChain} from "../../../drawing/draw_dunno";
import {rotate} from "../../../animations";
import {randomChoice} from "../../../utils/random_utils";
import {camera} from "../../game/camera";
import {closestPlayer, otherPlayer, tileDistance} from "../../../utils/game_utils";

export class Phantom extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["phantom.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.atk = 1;
        this.name = "Phantom";
        this.type = ENEMY_TYPE.PHANTOM;
        this.currentTurnDelay = this.turnDelay = 1;
        this.SLIDE_ANIMATION_TIME = 8;
        this.removeShadow();
    }

    move() {
        if (this.currentTurnDelay <= 0) {
            randomAggressiveAI(this, 99, false);
            this.currentTurnDelay = this.turnDelay;
        } else this.currentTurnDelay--;
    }

    damage(source, dmg, inputX, inputY, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        if (this.dead) return;
        super.damage(source, dmg, inputX, inputY, damageType);
        if (damageType.weaponal && (source === Game.player || source === Game.player2) && tileDistance(source, this) <= 3 && this.stun <= 0) {
            const tempPos = {x: this.tilePosition.x, y: this.tilePosition.y};
            source.removeFromMap();
            this.setTilePosition(source.tilePosition.x, source.tilePosition.y);
            source.setTilePosition(tempPos.x, tempPos.y);
            updateChain();
            rotate(source, randomChoice([true, false]));
            camera.moveToCenter(5);
            this.currentTurnDelay = this.turnDelay;
            if (!otherPlayer(source).dead
                && otherPlayer(source).tilePosition.x === this.tilePosition.x
                && otherPlayer(source).tilePosition.y === this.tilePosition.y) {
                this.die();
                otherPlayer(source).damage(1, this, false, true);
            }
        }
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
        if (this.currentTurnDelay <= 0) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        }
    }
}