"use strict";

class Roller extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/roller.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.direction = 1;
        this.ROLL_ANIMATION_TIME = 6;
        this.BUMP_ANIMATION_TIME = 14;
    }

    cancelAnimation() {
        GameState.APP.ticker.remove(this.animation);
        this.place();
        this.correctScale();
    }

    move() {
        let counter = 0;
        let roller = this;
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x] = "";
        if (isNotAWall(this.tilePosition.x + this.direction, this.tilePosition.y)) {
            let player = getPlayerOnTile(this.tilePosition.x + this.direction, this.tilePosition.y);
            if (player !== null) {
                damagePlayer(player, 5);
                this.bump();
            } else {
                const step = GameState.TILESIZE / this.ROLL_ANIMATION_TIME;
                this.tilePosition.x += this.direction;
                this.animation = function () {
                    roller.position.x += step * roller.direction;
                    counter++;
                    if (counter >= roller.ROLL_ANIMATION_TIME) {
                        GameState.APP.ticker.remove(roller.animation);
                        roller.place();
                    }
                };
                GameState.APP.ticker.add(this.animation);
            }
        } else this.bump();
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x] = "r";
    }

    turnAround() {
        this.direction *= -1;
        this.scale.x *= -1;
    }

    correctScale() {
        if ((this.direction === 1 && this.scale.x < 0) || this.direction === -1 && this.scale.x > 0) {
            this.scale.x *= -1
        }
    }

    bump() {
        let counter = 0;
        let roller = this;
        const oldDirection = this.direction;
        this.direction *= -1;
        const oldStep = oldDirection * GameState.TILESIZE / this.BUMP_ANIMATION_TIME;
        const newStep = oldStep * -1;
        const jumpHeight = 40;
        const a = jumpHeight / ((GameState.TILESIZE / 2 / 3) ** 2);
        const b = -(this.position.x + (1 / 3) * oldDirection * GameState.TILESIZE + (this.direction * GameState.TILESIZE) / 2 / 3) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);

        this.animation = function () {
            if (counter < roller.BUMP_ANIMATION_TIME / 3) {
                roller.position.x += oldStep;
                counter++;
            }
            else if (counter >= roller.BUMP_ANIMATION_TIME / 3 && counter < roller.BUMP_ANIMATION_TIME) {
                roller.correctScale();
                roller.position.x += newStep / 2;
                roller.position.y = a * (roller.position.x ** 2) + b * roller.position.x + c;
                counter++;
            } else if (counter >= roller.BUMP_ANIMATION_TIME) {
                GameState.APP.ticker.remove(roller.animation);
                roller.place();
            }
        };
        GameState.APP.ticker.add(this.animation);
    }
}