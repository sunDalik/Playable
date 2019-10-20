class Roller extends Enemy {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.direction = 1;
        this.animation = null;
    }

    move(gameMap) {
        let frequency = 15;
        let counter = 0;
        let roller = this;
        const step = tileSize / frequency;
        clearTimeout(this.animation);
        this.place(tileSize);

        gameMap[this.tilePosition.y][this.tilePosition.x] = "";
        if (isNotAWall(gameMap, this.tilePosition.x + this.direction, this.tilePosition.y)) {
            this.tilePosition.x += this.direction;
            animate();
        } else {
            this.direction *= -1;
            this.setAnchorToCenter();
            this.scale.x *= -1;
            this.place(tileSize);
        }
        gameMap[this.tilePosition.y][this.tilePosition.x] = "r";

        function animate() {
            roller.animation = setTimeout(() => {
                roller.position.x += step * roller.direction;
                counter++;
                if (counter < frequency) animate();
                else {
                    roller.animation = null;
                    roller.place(tileSize);
                }
            }, 2)
        }
    }

}