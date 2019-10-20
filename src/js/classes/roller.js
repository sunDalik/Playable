class Roller extends Enemy {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.direction = 1;
    }

    move(gameMap) {
        gameMap[this.tilePosition.y][this.tilePosition.x] = "";
        if (isNotAWall(gameMap, this.tilePosition.x + this.direction, this.tilePosition.y)) {
            this.tilePosition.x += this.direction;
            this.place(tileSize);
        } else {
            this.direction *= -1;
            this.setAnchorToCenter();
            this.scale.x *= -1;
            this.place(tileSize);
        }
        gameMap[this.tilePosition.y][this.tilePosition.x] = "r";
    }
}