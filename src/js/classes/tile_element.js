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
        this.fitToTile();
        this.place();
    }

    cancelAnimation() {
        GameState.APP.ticker.remove(this.animation);
        this.place();
        this.rotation = 0;
    }

    fitToTile() {
        const scaleX = GameState.TILESIZE / this.getUnscaledWidth() * 0.80;
        const scaleY = GameState.TILESIZE / this.getUnscaledHeight() * 0.80;
        this.scale.set(scaleX, scaleY);
    }

    place() {
        this.position.x = GameState.TILESIZE * this.tilePosition.x + (GameState.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = GameState.TILESIZE * this.tilePosition.y + (GameState.TILESIZE - this.height) / 2 + this.height * this.anchor.y;
    }

    getUnscaledWidth() {
        return this.width / this.scale.x;
    }

    getUnscaledHeight() {
        return this.width / this.scale.x;
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