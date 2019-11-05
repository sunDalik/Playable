"use strict";

class RollerB extends Roller {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/enemies/roller_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.atk = 1.25;
        this.ROLL_ANIMATION_TIME = 8;
        this.BUMP_ANIMATION_TIME = 14;
        this.entityType = ENEMY_TYPE.ROLLER_B;
    }

    move() {
        let lastDirTileEmpty = true;
        let lastNotDirTileEmpty = true;
        for (let x = 1; ; x++) {
            if (isNotOutOfMap(this.tilePosition.x + x * this.direction, this.tilePosition.y)) {
                if (lastDirTileEmpty === true) {
                    if (!isRelativelyEmpty(this.tilePosition.x + x * this.direction, this.tilePosition.y)) {
                        lastDirTileEmpty = false;
                    }
                    let player = getPlayerOnTile(this.tilePosition.x + x * this.direction, this.tilePosition.y);
                    if (player !== null) {
                        if (x === 1) {
                            player.damage(this.atk);
                            this.bump();
                        } else if (x === 2) {
                            player.damage(this.atk);
                            this.rollAndBump();
                        } else if (x >= 3) {
                            this.roll();
                        }
                        break;
                    }
                }
            }
            if (isNotOutOfMap(this.tilePosition.x - x * this.direction, this.tilePosition.y)) {
                if (lastNotDirTileEmpty === true) {
                    if (!isRelativelyEmpty(this.tilePosition.x - x * this.direction, this.tilePosition.y)) {
                        lastNotDirTileEmpty = false;
                    }
                    let player = getPlayerOnTile(this.tilePosition.x - x * this.direction, this.tilePosition.y);
                    if (player !== null) {
                        this.direction *= -1;
                        this.correctScale();
                        if (x === 1) {
                            player.damage(this.atk);
                            this.bump();
                        } else if (x === 2) {
                            player.damage(this.atk);
                            this.rollAndBump();
                        } else if (x >= 3) {
                            this.roll();
                        }
                        break;
                    }
                }
            }
            if ((lastDirTileEmpty === false && lastNotDirTileEmpty === false) ||
                (!isNotOutOfMap(this.tilePosition.x + x * this.direction, this.tilePosition.y) &&
                    !isNotOutOfMap(this.tilePosition.x - x * this.direction, this.tilePosition.y))) {
                break;
            }
        }
    }

    roll() {
        let counter = 0;
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
        const step = 2 * Game.TILESIZE / this.ROLL_ANIMATION_TIME;
        this.tilePosition.x += 2 * this.direction;
        this.animation = () => {
            this.position.x += step * this.direction;
            this.moveHealthContainer();
            counter++;
            if (counter >= this.ROLL_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        Game.APP.ticker.add(this.animation);
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
    }

    rollAndBump() {
        let counter = 0;
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
        let step = this.direction * Game.TILESIZE / (this.ROLL_ANIMATION_TIME / 2);
        const jumpHeight = Game.TILESIZE * 40 / 75;
        const a = jumpHeight / ((Game.TILESIZE / 2 / 3) ** 2);
        const b = -(this.position.x + (4 / 3) * this.direction * Game.TILESIZE + (-this.direction * Game.TILESIZE) / 2 / 3) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        this.tilePosition.x += this.direction;

        this.animation = () => {
            if (counter < this.ROLL_ANIMATION_TIME / 2) {
                this.position.x += step;
                counter++;
            } else if (counter < this.ROLL_ANIMATION_TIME / 2 + this.BUMP_ANIMATION_TIME / 3) {
                step = this.direction * Game.TILESIZE / this.BUMP_ANIMATION_TIME;
                this.position.x += step;
                counter++;
            } else if (counter < this.ROLL_ANIMATION_TIME / 2 + this.BUMP_ANIMATION_TIME) {
                this.position.x -= step / 2;
                this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
                counter++;
            } else if (counter >= this.ROLL_ANIMATION_TIME / 2 + this.BUMP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
            this.moveHealthContainer();
        };
        Game.APP.ticker.add(this.animation);
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
    }

    bump() {
        let counter = 0;
        const step = this.direction * Game.TILESIZE / this.BUMP_ANIMATION_TIME;
        const jumpHeight = Game.TILESIZE * 40 / 75;
        const a = jumpHeight / ((Game.TILESIZE / 2 / 3) ** 2);
        const b = -(this.position.x + (1 / 3) * this.direction * Game.TILESIZE + (-this.direction * Game.TILESIZE) / 2 / 3) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);

        this.animation = () => {
            if (counter < this.BUMP_ANIMATION_TIME / 3) {
                this.position.x += step;
                counter++;
            } else if (counter < this.BUMP_ANIMATION_TIME) {
                this.position.x -= step / 2;
                this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
                counter++;
            } else if (counter >= this.BUMP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
            this.moveHealthContainer();
        };
        Game.APP.ticker.add(this.animation);
    }

    damage(health, inputX, inputY) {
        if (inputX === 0 && this.stun === 0) {
            if (isEmpty(this.tilePosition.x, this.tilePosition.y + inputY)) {
                Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                this.stepY(inputY);
                Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
            } else this.bumpY(inputY);
        } else {
            this.health -= health;
            if (this.health <= 0) this.dead = true;
            this.healthContainer.visible = true;
            this.redrawHealth();
        }
    }
}