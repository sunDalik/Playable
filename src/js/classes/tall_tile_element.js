class TallTileElement extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.tileHeight = 2;
        this.place();
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE * (this.tileHeight - 1) + (Game.TILESIZE * this.tileHeight - this.height) + this.height * this.anchor.y;
    }

    fitToTile() {
        const scaleX = Game.TILESIZE / this.getUnscaledWidth();
        const scaleY = Game.TILESIZE * this.tileHeight / this.getUnscaledHeight();
        this.scale.set(scaleX, scaleY);
    }
}