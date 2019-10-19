class Player extends PIXI.Sprite {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture);
        this.tilePosition = {
            x: tilePositionX,
            y: tilePositionY
        };
        this.health = 100;
    }

    getPosition(tilesize) {
        const positionX = tileSize * this.tilePosition.x + (tileSize - this.width) / 2;
        const positionY = tileSize * this.tilePosition.y + (tileSize - this.height) / 2;
        return {x: positionX, y: positionY}
    }

    getScale(tilesize) {
        const scaleX = tileSize / this.width - 0.25;
        const scaleY = tileSize / this.height - 0.25;
        return {x: scaleX, y: scaleY}
    }

    move(tileSize) {
        this.y = tileSize * this.tilePosition.y;
        this.x = tileSize * this.tilePosition.x;
    }

}