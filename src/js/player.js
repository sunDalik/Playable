class Player extends PIXI.Sprite {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture);
        this.tilePosition = {
            x: tilePositionX,
            y: tilePositionY
        };
        this.health = 100;
    }

    getPosition(tileSize) {
        const positionX = tileSize * this.tilePosition.x + (tileSize - this.width) / 2;
        const positionY = tileSize * this.tilePosition.y + (tileSize - this.height) / 2;
        return {x: positionX, y: positionY}
    }

    getScale(tileSize) {
        const scaleX = tileSize / this.width - 0.25;
        const scaleY = tileSize / this.height - 0.25;
        return {x: scaleX, y: scaleY}
    }

    move(tileSize) {
        this.position.x = tileSize * this.tilePosition.x + (tileSize - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = tileSize * this.tilePosition.y + (tileSize - this.height) / 2 + this.height * this.anchor.y;
    }

    setAnchorToCenter() {
        this.anchor.set(0.5, 0.5);
        this.position.x += this.width * 0.5;
        this.position.y += this.height * 0.5;
    }

    resetAnchor() {
        const previousAnchorX = this.anchor.x;
        const previousAnchorY = this.anchor.y;
        this.anchor.set(0, 0);
        this.position.x -= this.width * previousAnchorX;
        this.position.y -= this.height * previousAnchorY;
    }
}