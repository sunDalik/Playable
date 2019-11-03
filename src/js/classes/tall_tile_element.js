class TallTileElement extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.tileHeight = 2;
        this.place();
    }

    //something wrong with these methods, don't know yet
    place() {
        this.position.x = GameState.TILESIZE * this.tilePosition.x + (GameState.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = GameState.TILESIZE * this.tilePosition.y - GameState.TILESIZE * (this.tileHeight - 1) + (GameState.TILESIZE * this.tileHeight - this.height) + this.height * this.anchor.y;
    }

    fitToTile() {
        const scaleX = GameState.TILESIZE / this.getUnscaledWidth() * 0.9;
        const scaleY = GameState.TILESIZE * this.tileHeight / this.getUnscaledHeight() * 0.9;
        this.scale.set(scaleX, scaleY);
    }
}