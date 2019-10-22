"use strict";

class StarB extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0) {
        super(GameState.resources["src/images/enemies/star_b.png"].texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.animation = null;
    }

//change
    move() {
        let frequency = 15;
        let counter = 0;
        let roller = this;
        const step = GameState.TILESIZE / frequency;
        clearTimeout(this.animation);
        this.place();

        GameState.gameMap[this.tilePosition.y][this.tilePosition.x] = "";
        if (isNotAWall(this.tilePosition.x + this.direction, this.tilePosition.y)) {
            this.tilePosition.x += this.direction;
            animate();
        } else {
            this.direction *= -1;
            this.scale.x *= -1;
        }
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
    }

}