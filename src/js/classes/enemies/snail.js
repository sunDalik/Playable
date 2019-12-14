import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {PoisonHazard} from "../hazards/poison";
import {getPlayerOnTile, isAnyWall, isInanimate, isRelativelyEmpty} from "../../map_checks";
import {closestPlayer} from "../../utils/game_utils";

export class Snail extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/snail.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SNAIL;
        this.atk = 1;
        this.turnDelay = 1;
        this.currentTurnDelay = 0;
        this.chase = false;
    }

    afterMapGen() {
        if (isAnyWall(this.tilePosition.x + 1, this.tilePosition.y)
            || isInanimate(this.tilePosition.x + 1, this.tilePosition.y)) {
            this.scale.x *= -1;
        }
    }

    move() {
        if (this.currentTurnDelay === 0) {
            if (this.chase) {
                this.chasePlayer(closestPlayer(this));
                this.currentTurnDelay = this.turnDelay;
            } else {
                if (this.canSeePlayers()) this.chase = true;
            }
            Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y));
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

    chasePlayer(player) {
        const playerDistX = Math.abs(player.tilePosition.x - this.tilePosition.x);
        const playerDistY = Math.abs(player.tilePosition.y - this.tilePosition.y);
        const playerDirX = Math.sign(player.tilePosition.x - this.tilePosition.x);
        const playerDirY = Math.sign(player.tilePosition.y - this.tilePosition.y);

        const tryToStepXPrimary = () => {
            this.tryToStep(playerDirX, 0) || this.tryToStep(0, playerDirY) || this.slideBump(playerDirX, 0);
        };

        const tryToStepYPrimary = () => {
            this.tryToStep(0, playerDirY) || this.tryToStep(playerDirX, 0) || this.slideBump(0, playerDirY);
        };

        if (playerDistX > playerDistY) tryToStepXPrimary();
        else if (playerDistX < playerDistY) tryToStepYPrimary();
        else {
            if (Math.random() < 0.5) tryToStepXPrimary();
            else tryToStepYPrimary();
        }
    }

    tryToStep(tileStepX, tileStepY) {
        if (tileStepX === 0 && tileStepY === 0) return false;
        if (isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY)) {
            const player = getPlayerOnTile(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY);
            if (player) {
                player.damage(this.atk, this);
                this.slideBump(tileStepX, tileStepY);
            } else this.slide(tileStepX, tileStepY);
            return true;
        }
        return false;
    }

    correctScale(tileStepX, tileStepY) {
        if (tileStepX !== 0 && Math.sign(tileStepX) !== Math.sign(this.scale.x)
            || tileStepY !== 0 && Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x) !== Math.sign(this.scale.x)) {
            this.scale.x *= -1;
        }
    }
}