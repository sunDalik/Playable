"use strict";

class Spider extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/enemies/spider.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.entityType = ENEMY_TYPE.SPIDER;
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
                Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
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

    stepX(tileStepX) {
        this.tilePosition.x += tileStepX;
        const jumpHeight = Game.TILESIZE * 25 / 75;
        const a = jumpHeight / ((tileStepX * Game.TILESIZE / 2) ** 2);
        const b = -(this.position.x + (tileStepX * Game.TILESIZE) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        const stepX = tileStepX * Game.TILESIZE / this.STEP_ANIMATION_TIME;
        let counter = 0;

        Game.APP.ticker.remove(this.animation); //spider specific (or rather cancellable specific). I don't really understand why do I need this but I need this
        this.animation = () => {
            this.position.x += stepX;
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            counter++;
            this.moveHealthContainer();
            if (counter >= this.STEP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    bumpX(tileStepX) {
        const jumpHeight = Game.TILESIZE * 25 / 75;
        const a = jumpHeight / ((tileStepX * Game.TILESIZE / 2) ** 2);
        const b = -(this.position.x + (tileStepX * Game.TILESIZE / 2) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        const stepX = tileStepX * Game.TILESIZE / this.BUMP_ANIMATION_TIME;
        let counter = 0;

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            if (counter < this.BUMP_ANIMATION_TIME / 2) {
                this.position.x += stepX;
            } else {
                this.position.x -= stepX;
            }
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            this.moveHealthContainer();
            counter++;
            if (counter >= this.BUMP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    stepY(tileStepY) {
        this.tilePosition.y += tileStepY;
        let counter = 0;
        const oldPosition = this.position.y;
        let x = 0;
        let P0, P1, P2, P3;
        if (tileStepY < 0) {
            P0 = 0.17;
            P1 = 0.89;
            P2 = 0.84;
            P3 = 1.24;
        } else {
            P0 = 0.42;
            P1 = -0.37;
            P2 = 0.97;
            P3 = 0.75;
        }

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            x += 1 / this.STEP_ANIMATION_TIME;
            this.position.y = oldPosition + cubicBezier(x, P0, P1, P2, P3) * Game.TILESIZE * tileStepY;
            this.moveHealthContainer();
            counter++;
            if (counter >= this.STEP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    bumpY(tileStepY) {
        let counter = 0;
        const oldPosition = this.position.y;
        let newPosition = null;
        let x = 0;
        let P0, P1, P2, P3;
        if (tileStepY < 0) {
            P0 = 0.17;
            P1 = 0.89;
            P2 = 0.84;
            P3 = 1.24;
        } else {
            P0 = 0.42;
            P1 = -0.37;
            P2 = 0.97;
            P3 = 0.75;
        }

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            x += 1 / this.BUMP_ANIMATION_TIME;
            if (counter < this.BUMP_ANIMATION_TIME / 2) {
                this.position.y = oldPosition + cubicBezier(x, P0, P1, P2, P3) * Game.TILESIZE / 2 * tileStepY;
                newPosition = this.position.y;
            } else {
                this.position.y = newPosition - cubicBezier(x, P0, P1, P2, P3) * Game.TILESIZE / 2 * tileStepY;
            }
            this.moveHealthContainer();
            counter++;
            if (counter >= this.BUMP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        Game.APP.ticker.add(this.animation);
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
                player.damage(this.atk);
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
                player.damage(this.atk);
                this.bumpY(tileStepY);
            } else this.stepY(tileStepY);
            return true;
        }
        return false;
    }

    throwAway(throwX, throwY) {
        if (throwX !== 0) {
            if (isRelativelyEmpty(this.tilePosition.x + throwX, this.tilePosition.y)) {
                const player = getPlayerOnTile(this.tilePosition.x + throwX, this.tilePosition.y);
                if (player === null) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepX(throwX);
                    this.thrown = true;
                    this.cancellable = false;
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
                }
            }
        } else if (throwY !== 0) {
            if (isRelativelyEmpty(this.tilePosition.x, this.tilePosition.y + throwY)) {
                const player = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + throwY);
                if (player === null) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepY(throwY);
                    this.thrown = true;
                    this.cancellable = false;
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
                }
            }
        }
    }
}