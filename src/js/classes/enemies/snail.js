"use strict";

class Snail extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/snail.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 2;
        this.entityType = ENEMY_TYPE.SNAIL;
        this.atk = 1;
        this.turnDelay = 0;
        this.chase = false;
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
                            this.stepX(path[0].y - this.tilePosition.x);
                        } else this.stepY(path[0].x - this.tilePosition.y);
                    }
                 */

                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;
                const player1DistX = GameState.player.tilePosition.x - this.tilePosition.x;
                const player1DistY = GameState.player.tilePosition.y - this.tilePosition.y;
                const player1Dist = Math.abs(player1DistX) + Math.abs(player1DistY);

                const player2DistX = GameState.player2.tilePosition.x - this.tilePosition.x;
                const player2DistY = GameState.player2.tilePosition.y - this.tilePosition.y;
                const player2Dist = Math.abs(player2DistX) + Math.abs(player2DistY);
                if (player1Dist < player2Dist) {
                    this.chasePlayer(GameState.player);
                } else {
                    this.chasePlayer(GameState.player2);
                }
                this.turnDelay = 1;
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = this;
            } else {
                if (this.canSeePlayers()) {
                    this.chase = true;
                    this.move();
                }
            }
        } else this.turnDelay--;
        if (GameState.gameMap[this.tilePosition.y][this.tilePosition.x].hazard === null) {
            new PoisonHazard(this.tilePosition.x, this.tilePosition.y).addToWorld();
        } else GameState.gameMap[this.tilePosition.y][this.tilePosition.x].hazard.refreshLifetime();
    }

    stepX(tileStepX) {
        this.tilePosition.x += tileStepX;
        this.place();
    }

    stepY(tileStepY) {
        this.tilePosition.y += tileStepY;
        this.place();
    }

    chasePlayer(player) {
        const playerDistX = player.tilePosition.x - this.tilePosition.x;
        const playerDistY = player.tilePosition.y - this.tilePosition.y;
        const playerDirX = Math.sign(playerDistX);
        const playerDirY = Math.sign(playerDistY);

        if (Math.abs(playerDistX) > Math.abs(playerDistY)) {
            if (!this.tryToStepX(playerDirX)) {
                this.tryToStepY(playerDirY);
            }
        } else if (Math.abs(playerDistX) < Math.abs(playerDistY)) {
            if (!this.tryToStepY(playerDirY)) {
                this.tryToStepX(playerDirX);
            }
        } else {
            const randomDirection = getRandomInt(0, 2);
            if (randomDirection === 0) {
                if (!this.tryToStepX(playerDirX)) {
                    this.tryToStepY(playerDirY);
                }
            } else {
                if (!this.tryToStepY(playerDirY)) {
                    this.tryToStepX(playerDirX);
                }
            }
        }
    }

    tryToStepX(tileStepX) {
        if (isNotAWallOrEnemy(this.tilePosition.x + tileStepX, this.tilePosition.y)) {
            const player = getPlayerOnTile(this.tilePosition.x + tileStepX, this.tilePosition.y);
            if (player !== null) damagePlayer(player, this.atk);
            else this.stepX(tileStepX);
            return true;
        }
        return false;
    }

    tryToStepY(tileStepY) {
        if (isNotAWallOrEnemy(this.tilePosition.x, this.tilePosition.y + tileStepY)) {
            const player = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + tileStepY);
            if (player !== null) damagePlayer(player, this.atk);
            else this.stepY(tileStepY);
            return true;
        }
        return false;
    }
}