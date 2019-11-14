import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {getPlayerOnTile, isEmpty, isRelativelyEmpty} from "../../map_checks";
import {getRandomInt} from "../../utils/random_utils";

export class Spider extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/spider.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
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
            if (this.chase) {
                Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                const player1DistX = Game.player.tilePosition.x - this.tilePosition.x;
                const player1DistY = Game.player.tilePosition.y - this.tilePosition.y;
                const player1Dist = Math.abs(player1DistX) + Math.abs(player1DistY);

                const player2DistX = Game.player2.tilePosition.x - this.tilePosition.x;
                const player2DistY = Game.player2.tilePosition.y - this.tilePosition.y;
                const player2Dist = Math.abs(player2DistX) + Math.abs(player2DistY);
                if (Game.player.dead) this.chasePlayer(Game.player2);
                else if (Game.player2.dead) this.chasePlayer(Game.player);
                else if (player1Dist < player2Dist) {
                    this.chasePlayer(Game.player);
                } else {
                    this.chasePlayer(Game.player2);
                }
                this.updateMapPosition();
            } else {
                if (this.canSeePlayers()) {
                    this.chase = true;
                    this.move();
                }
            }
        } else {
            this.thrown = false;
            this.cancellable = true;
        }
    }

    chasePlayer(player) {
        const playerDistX = player.tilePosition.x - this.tilePosition.x;
        const playerDistY = player.tilePosition.y - this.tilePosition.y;
        const playerDirX = Math.sign(playerDistX);
        const playerDirY = Math.sign(playerDistY);

        if (Math.abs(playerDistX) > Math.abs(playerDistY)) {
            if (!this.tryToStepX(playerDirX)) {
                if (playerDirY === 0) this.bumpX(playerDirX);
                else if (!this.tryToStepY(playerDirY)) this.bumpY(playerDirY);
            }
        } else if (Math.abs(playerDistX) < Math.abs(playerDistY)) {
            if (!this.tryToStepY(playerDirY)) {
                if (playerDirX === 0) this.bumpY(playerDirY);
                else if (!this.tryToStepX(playerDirX)) this.bumpX(playerDirX);
            }
        } else {
            const randomDirection = getRandomInt(0, 2);
            if (randomDirection === 0) {
                if (!this.tryToStepX(playerDirX)) {
                    if (playerDirY === 0) this.bumpX(playerDirX);
                    else if (!this.tryToStepY(playerDirY)) this.bumpY(playerDirY);
                }
            } else {
                if (!this.tryToStepY(playerDirY)) {
                    if (playerDirX === 0) this.bumpY(playerDirY);
                    else if (!this.tryToStepX(playerDirX)) this.bumpX(playerDirX);
                }
            }
        }
    }

    tryToStepX(tileStepX) {
        if (isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y)) {
            const player = getPlayerOnTile(this.tilePosition.x + tileStepX, this.tilePosition.y);
            if (player !== null) {
                player.damage(this.atk, this);
                this.bumpX(tileStepX);
            } else this.stepX(tileStepX);
            return true;
        }
        return false;
    }

    tryToStepY(tileStepY) {
        if (isRelativelyEmpty(this.tilePosition.x, this.tilePosition.y + tileStepY)) {
            const player = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + tileStepY);
            if (player !== null) {
                player.damage(this.atk, this);
                this.bumpY(tileStepY);
            } else this.stepY(tileStepY);
            return true;
        }
        return false;
    }

    damage(dmg, inputX, inputY, magical) {
        super.damage(dmg, inputX, inputY, magical);
        if (!this.dead && this.stun === 0) this.throwAway(inputX, inputY);
    }

    throwAway(throwX, throwY) {
        if (this.stun === 0) {
            if (throwX !== 0) {
                if (isEmpty(this.tilePosition.x + throwX, this.tilePosition.y)) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepX(throwX);
                    this.thrown = true;
                    this.cancellable = false;
                    this.updateMapPosition();
                }
            } else if (throwY !== 0) {
                if (isEmpty(this.tilePosition.x, this.tilePosition.y + throwY)) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepY(throwY);
                    this.thrown = true;
                    this.cancellable = false;
                    this.updateMapPosition();
                }
            }
        }
    }
}