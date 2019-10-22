"use strict";

class TileElement extends PIXI.Sprite {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture);
        this.tilePosition = {
            x: tilePositionX,
            y: tilePositionY
        };
        this.animation = null;
        this.anchor.set(0.5, 0.5);
        this.scale.set(this.getTileScale().x, this.getTileScale().y);
    }

    cancelAnimation() {
        GameState.APP.ticker.remove(this.animation);
        this.place();
        this.rotation = 0;
    }

    getTileScale() {
        const scaleX = GameState.TILESIZE / this.width * 0.80;
        const scaleY = GameState.TILESIZE / this.height * 0.80;
        return {x: scaleX, y: scaleY}
    }

    place() {
        this.position.x = GameState.TILESIZE * this.tilePosition.x + (GameState.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = GameState.TILESIZE * this.tilePosition.y + (GameState.TILESIZE - this.height) / 2 + this.height * this.anchor.y;
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