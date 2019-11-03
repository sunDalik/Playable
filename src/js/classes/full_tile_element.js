class FullTileElement extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
    }

    fitToTile() {
        const scaleX = GameState.TILESIZE / this.getUnscaledWidth();
        const scaleY = GameState.TILESIZE / this.getUnscaledHeight();
        this.scale.set(scaleX, scaleY);
    }
}