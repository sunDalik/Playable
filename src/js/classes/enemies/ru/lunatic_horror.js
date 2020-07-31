import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums/enums";
import {closestPlayer, getAngleForDirection, otherPlayer} from "../../../utils/game_utils";
import {IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {Game} from "../../../game";
import {getDiagonalChasingOptions} from "../../../utils/map_utils";
import {randomChoice} from "../../../utils/random_utils";
import {getPlayerOnTile} from "../../../map_checks";

export class LunaticHorror extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["lunatic_horror.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 1;
        this.type = ENEMY_TYPE.LUNATIC_HORROR;
        this.atk = 1;
        this.currentTurnDelay = this.turnDelay = 1;
        this.tallModifier = Game.TILESIZE / 3;
        this.SLIDE_ANIMATION_TIME = 6;
    }

    move() {
        if (this.currentTurnDelay <= 0) {
            const initPlayer = closestPlayer(this);
            let movementOptions = getDiagonalChasingOptions(this, initPlayer);
            if (movementOptions.length === 0 && !otherPlayer(initPlayer).dead) {
                movementOptions = getDiagonalChasingOptions(this, otherPlayer(initPlayer));
            }
            if (movementOptions.length !== 0) {
                const dir = randomChoice(movementOptions);
                const player = getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
                if (player) {
                    this.slideBump(dir.x, dir.y);
                    player.damage(this.atk, this, true);
                } else {
                    this.slide(dir.x, dir.y);
                }
            } else {
                this.slideBump(Math.sign(initPlayer.tilePosition.x - this.tilePosition.x), Math.sign(initPlayer.tilePosition.y - this.tilePosition.y));
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