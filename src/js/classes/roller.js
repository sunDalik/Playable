"use strict";

class Roller extends Enemy {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.direction = 1;
        this.animation = null;
    }

    cancelAnimation() {
        clearInterval(this.animation);
        this.place();
        this.correctScale();
    }

    move() {
        let frequency = 15;
        let counter = 0;
        let roller = this;
        const step = GameState.TILESIZE / frequency;
        this.cancelAnimation();
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x] = "";
        if (isNotAWall(this.tilePosition.x + this.direction, this.tilePosition.y)) {
            let player = getPlayerOnTile(this.tilePosition.x + this.direction, this.tilePosition.y);
            if (player !== null) {
                damagePlayer(player, 5);
                this.direction *= -1;
                animateBump();
            } else {
                this.tilePosition.x += this.direction;
                animate();
            }
        } else this.turnAround();
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x] = "r";

        function animate() {
            roller.animation = setTimeout(() => {
                roller.position.x += step * roller.direction;
                counter++;
                if (counter < frequency) animate();
                else {
                    roller.animation = null;
                    roller.place();
                }
            }, 2)
        }

        function animateBump() {
            roller.animation = setTimeout(() => {
                if (counter <= frequency / 2) {
                    roller.position.x += step * -roller.direction;
                    counter++;
                    animateBump();
                }
                else if (counter > frequency / 2 && counter < frequency) {
                    roller.correctScale();
                    roller.position.x += step * roller.direction;
                    counter++;
                    animateBump();
                } else {
                    roller.animation = null;
                    roller.place();
                }
            }, 2)
        }
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
}