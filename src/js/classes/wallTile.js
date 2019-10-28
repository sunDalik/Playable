class WallTile extends TileElement {
    constructor(tilePositionX = 0, tilePositionY = 0) {
        super(GameState.resources["src/images/wall.png"].texture, tilePositionX, tilePositionY);
        this.width = GameState.TILESIZE;
        this.height = GameState.TILESIZE;
        this.place();
    }

    fitToTile() {
        const scaleX = GameState.TILESIZE / this.getUnscaledWidth();
        const scaleY = GameState.TILESIZE / this.getUnscaledHeight();
        this.scale.set(scaleX, scaleY);
    }
}