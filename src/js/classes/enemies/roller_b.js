"use strict";

class RollerB extends Roller {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/roller_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.ROLL_ANIMATION_TIME = 8;
        this.BUMP_ANIMATION_TIME = 14;
    }

    move() {
        let lastDirTile = "";
        let lastNotDirTile = "";
        for (let x = 1; ; x++) {
            if (isNotOutOfMap(this.tilePosition.x + x * this.direction, this.tilePosition.y)) {
                if (lastDirTile === "") {
                    lastDirTile = GameState.gameMap[this.tilePosition.y][this.tilePosition.x + x * this.direction];
                    let player = getPlayerOnTile(this.tilePosition.x + x * this.direction, this.tilePosition.y);
                    if (player !== null) {
                        if (x === 1) {
                            this.bump();
                        } else if (x === 2) {
                            this.rollAndBump();
                        } else if (x >= 3) {
                            this.roll();
                        }
                        break;
                    }
                }
            }
            if (isNotOutOfMap(this.tilePosition.x - x * this.direction, this.tilePosition.y)) {
                if (lastNotDirTile === "") {
                    lastNotDirTile = GameState.gameMap[this.tilePosition.y][this.tilePosition.x - x * this.direction];
                    let player = getPlayerOnTile(this.tilePosition.x - x * this.direction, this.tilePosition.y);
                    if (player !== null) {
                        this.direction *= -1;
                        this.correctScale();
                        if (x === 1) {
                            this.bump();
                        } else if (x === 2) {
                            this.rollAndBump();
                        } else if (x >= 3) {
                            this.roll();
                        }
                        break;
                    }
                }
            }
            if ((lastDirTile !== "" && lastNotDirTile !== "") ||
                (!isNotOutOfMap(this.tilePosition.x + x * this.direction, this.tilePosition.y) &&
                    !isNotOutOfMap(this.tilePosition.x - x * this.direction, this.tilePosition.y))) {
                break;
            }
        }


    }

    roll() {
        let counter = 0;
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x] = "";
        const step = 2 * GameState.TILESIZE / this.ROLL_ANIMATION_TIME;
        this.tilePosition.x += 2 * this.direction;
        this.animation = () => {
            this.position.x += step * this.direction;
            counter++;
            if (counter >= this.ROLL_ANIMATION_TIME) {
                GameState.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        GameState.APP.ticker.add(this.animation);
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x] = "rb";
    }

    rollAndBump() {
        let counter = 0;
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x] = "";
        let step = this.direction * GameState.TILESIZE / (this.ROLL_ANIMATION_TIME / 2);
        const jumpHeight = 40;
        const a = jumpHeight / ((GameState.TILESIZE / 2 / 3) ** 2);
        const b = -(this.position.x + (4 / 3) * this.direction * GameState.TILESIZE + (-this.direction * GameState.TILESIZE) / 2 / 3) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        this.tilePosition.x += this.direction;

        this.animation = () => {
            if (counter < this.ROLL_ANIMATION_TIME / 2) {
                this.position.x += step;
                counter++;
            }
            else if (counter < this.ROLL_ANIMATION_TIME / 2 + this.BUMP_ANIMATION_TIME / 3) {
                step = this.direction * GameState.TILESIZE / this.BUMP_ANIMATION_TIME;
                this.position.x += step;
                counter++;
            }
            else if (counter < this.ROLL_ANIMATION_TIME / 2 + this.BUMP_ANIMATION_TIME) {
                this.position.x -= step / 2;
                this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
                counter++;
            } else if (counter >= this.ROLL_ANIMATION_TIME / 2 + this.BUMP_ANIMATION_TIME) {
                GameState.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        GameState.APP.ticker.add(this.animation);
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x] = "rb";
    }

    bump() {
        let counter = 0;
        const step = this.direction * GameState.TILESIZE / this.BUMP_ANIMATION_TIME;
        const jumpHeight = 40;
        const a = jumpHeight / ((GameState.TILESIZE / 2 / 3) ** 2);
        const b = -(this.position.x + (1 / 3) * this.direction * GameState.TILESIZE + (-this.direction * GameState.TILESIZE) / 2 / 3) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);

        this.animation = () => {
            if (counter < this.BUMP_ANIMATION_TIME / 3) {
                this.position.x += step;
                counter++;
            }
            else if (counter < this.BUMP_ANIMATION_TIME) {
                this.position.x -= step / 2;
                this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
                counter++;
            } else if (counter >= this.BUMP_ANIMATION_TIME) {
                GameState.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        GameState.APP.ticker.add(this.animation);
    }
}