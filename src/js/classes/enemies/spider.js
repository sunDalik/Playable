import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {getPlayerOnTile, isEmpty, isRelativelyEmpty} from "../../map_checks";
import {closestPlayer} from "../../utils/game_utils";

export class Spider extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/spider.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 1.5;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SPIDER;
        this.atk = 0.5;
        this.chase = false;
        this.thrown = false;
        this.STEP_ANIMATION_TIME = 6;
        this.BUMP_ANIMATION_TIME = 12;
    }

    move() {
        if (!this.thrown) {
            if (this.chase) this.chasePlayer(closestPlayer(this));
            else {
                if (this.canSeePlayers()) {
                    this.chase = true;
                    this.move();
                }
            }
        } else this.thrown = false;
    }

    chasePlayer(player) {
        const playerDistX = Math.abs(player.tilePosition.x - this.tilePosition.x);
        const playerDistY = Math.abs(player.tilePosition.y - this.tilePosition.y);
        const playerDirX = Math.sign(player.tilePosition.x - this.tilePosition.x);
        const playerDirY = Math.sign(player.tilePosition.y - this.tilePosition.y);

        const tryToStepXPrimary = () => {
            this.tryToStep(playerDirX, 0) || this.tryToStep(0, playerDirY) || this.bump(playerDirX, 0);
        };

        const tryToStepYPrimary = () => {
            this.tryToStep(0, playerDirY) || this.tryToStep(playerDirX, 0) || this.bump(0, playerDirY);
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
                this.bump(tileStepX, tileStepY);
            } else this.step(tileStepX, tileStepY);
            return true;
        }
        return false;
    }

    damage(source, dmg, inputX, inputY, magical = false, hazardDamage = false) {
        super.damage(source, dmg, inputX, inputY, magical, hazardDamage);
        if (!this.dead && this.stun === 0) this.throwAway(inputX, inputY);
        if (Game.afterTurn) {
            this.thrown = false;
        }
    }

    throwAway(throwX, throwY) {
        if (throwX !== 0 || throwY !== 0) {
            if (isEmpty(this.tilePosition.x + throwX, this.tilePosition.y + throwY)) {
                this.throwStep(throwX, throwY);
                return true;
            }
        }
        return false;
    }

    throwStep(throwX, throwY) {
        this.step(throwX, throwY);
        this.thrown = true;
        this.cancellable = false;
    }
}