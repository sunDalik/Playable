"use strict";

class Roller extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/roller.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 1;
        this.atk = 1;
        this.direction = 1;
        this.ROLL_ANIMATION_TIME = 6;
        this.BUMP_ANIMATION_TIME = 14;
        this.entityType = ENEMY_TYPE.ROLLER;
    }

    cancelAnimation() {
        GameState.APP.ticker.remove(this.animation);
        this.place();
        this.correctScale();
    }

    move() {
        let counter = 0;
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;
        if (isNotAWallOrEnemy(this.tilePosition.x + this.direction, this.tilePosition.y)) {
            let player = getPlayerOnTile(this.tilePosition.x + this.direction, this.tilePosition.y);
            if (player !== null) {
                player.damage(this.atk);
                this.bump();
            } else {
                const step = GameState.TILESIZE / this.ROLL_ANIMATION_TIME;
                this.tilePosition.x += this.direction;
                this.animation = () => {
                    this.position.x += step * this.direction;
                    counter++;
                    if (counter >= this.ROLL_ANIMATION_TIME) {
                        GameState.APP.ticker.remove(this.animation);
                        this.place();
                    }
                };
                GameState.APP.ticker.add(this.animation);
            }
        } else this.bump();
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = this;
    }

    turnAround() {
        this.direction *= -1;
        this.scale.x *= -1;
    }

    correctScale() {
        if ((this.direction === 1 && this.scale.x < 0) || (this.direction === -1 && this.scale.x > 0)) {
            this.scale.x *= -1
        }
    }

    bump() {
        let counter = 0;
        const oldDirection = this.direction;
        this.direction *= -1;
        const oldStep = oldDirection * GameState.TILESIZE / this.BUMP_ANIMATION_TIME;
        const newStep = oldStep * -1;
        const jumpHeight = GameState.TILESIZE * 40 / 75;
        const a = jumpHeight / ((GameState.TILESIZE / 2 / 3) ** 2);
        const b = -(this.position.x + (1 / 3) * oldDirection * GameState.TILESIZE + (this.direction * GameState.TILESIZE) / 2 / 3) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);

        this.animation = () => {
            if (counter < this.BUMP_ANIMATION_TIME / 3) {
                this.position.x += oldStep;
                counter++;
            } else if (counter >= this.BUMP_ANIMATION_TIME / 3 && counter < this.BUMP_ANIMATION_TIME) {
                this.correctScale();
                this.position.x += newStep / 2;
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