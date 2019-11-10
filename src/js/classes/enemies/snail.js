"use strict";

class Snail extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/enemies/snail.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.entityType = ENEMY_TYPE.SNAIL;
        this.atk = 1;
        this.turnDelay = 0;
        this.chase = false;
        this.SLIDE_ANIMATION_TIME = 12;
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.chase) {
                /*
                    let path;
                    const path1 = this.getPathToPlayer1();
                    const path2 = this.getPathToPlayer2();
                    path = path1.length < path2.length ? path1 : path2;
                    if (path.length !== 0) {
                        if (path[0].y !== this.tilePosition.x) {
                            this.slideX(path[0].y - this.tilePosition.x);
                        } else this.slideY(path[0].x - this.tilePosition.y);
                    }
                 */

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
                this.turnDelay = 1;
                Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
            } else {
                if (this.canSeePlayers()) {
                    this.chase = true;
                    this.move();
                }
            }
        } else this.turnDelay--;
        if (Game.map[this.tilePosition.y][this.tilePosition.x].hazard === null) {
            new PoisonHazard(this.tilePosition.x, this.tilePosition.y).addToWorld();
        } else Game.map[this.tilePosition.y][this.tilePosition.x].hazard.refreshLifetime();
    }

    slideX(tileStepX) {
        if (Math.sign(tileStepX) !== Math.sign(this.scale.x)) {
            this.scale.x *= -1;
        }
        super.slideX(tileStepX)
    }

    slideBumpX(tileStepX) {
        if (Math.sign(tileStepX) !== Math.sign(this.scale.x)) {
            this.scale.x *= -1;
        }
        super.slideBumpX(tileStepX)
    }

    chasePlayer(player) {
        const playerDistX = player.tilePosition.x - this.tilePosition.x;
        const playerDistY = player.tilePosition.y - this.tilePosition.y;
        const playerDirX = Math.sign(playerDistX);
        const playerDirY = Math.sign(playerDistY);

        if (Math.abs(playerDistX) > Math.abs(playerDistY)) {
            if (!this.tryToStepX(playerDirX)) {
                if (playerDirY === 0) this.slideBumpX(playerDirX);
                else if (!this.tryToStepY(playerDirY)) this.slideBumpY(playerDirY);
            }
        } else if (Math.abs(playerDistX) < Math.abs(playerDistY)) {
            if (!this.tryToStepY(playerDirY)) {
                if (playerDirX === 0) this.slideBumpY(playerDirY);
                else if (!this.tryToStepX(playerDirX)) this.slideBumpX(playerDirX);
            }
        } else {
            const randomDirection = getRandomInt(0, 2);
            if (randomDirection === 0) {
                if (!this.tryToStepX(playerDirX)) {
                    if (playerDirY === 0) this.slideBumpX(playerDirX);
                    else if (!this.tryToStepY(playerDirY)) this.slideBumpY(playerDirY);
                }
            } else {
                if (!this.tryToStepY(playerDirY)) {
                    if (playerDirX === 0) this.slideBumpY(playerDirY);
                    else if (!this.tryToStepX(playerDirX)) this.slideBumpX(playerDirX);
                }
            }
        }
    }

    tryToStepX(tileStepX) {
        if (isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y)) {
            const player = getPlayerOnTile(this.tilePosition.x + tileStepX, this.tilePosition.y);
            if (player !== null) {
                player.damage(this.atk);
                this.slideBumpX(tileStepX);
            } else this.slideX(tileStepX);
            return true;
        }
        return false;
    }

    tryToStepY(tileStepY) {
        if (isRelativelyEmpty(this.tilePosition.x, this.tilePosition.y + tileStepY)) {
            const player = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + tileStepY);
            if (player !== null) {
                player.damage(this.atk);
                this.slideBumpY(tileStepY);
            } else this.slideY(tileStepY);
            return true;
        }
        return false;
    }
}