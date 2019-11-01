class Hazard extends FullTileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.width = GameState.TILESIZE;
        this.height = GameState.TILESIZE;
        this.zIndex = -1;
        this.LIFETIME = 0;
        this.turnsLeft = this.LIFETIME;
        this.atk = 0;
    }

    addToWorld() {
        GameState.gameWorld.addChild(this);
        GameState.hazards.push(this);
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x].hazard = this;
    }

    removeFromWorld() {
        GameState.gameWorld.removeChild(this);
        removeObjectFromArray(this, GameState.hazards);
        GameState.gameMap[this.tilePosition.y][this.tilePosition.x].hazard = null;
    }

    updateLifetime() {
        if (this.turnsLeft === 0) {
            this.removeFromWorld();
            this.turnsLeft = -99;
        } else this.turnsLeft--;
    }

    refreshLifetime() {
        this.turnsLeft = this.LIFETIME;
    }
}