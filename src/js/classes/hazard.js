class Hazard extends FullTileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.width = Game.TILESIZE;
        this.height = Game.TILESIZE;
        this.zIndex = -1;
        this.LIFETIME = 0;
        this.turnsLeft = this.LIFETIME;
        this.atk = 0;
    }

    addToWorld() {
        Game.gameWorld.addChild(this);
        Game.hazards.push(this);
        Game.gameMap[this.tilePosition.y][this.tilePosition.x].hazard = this;
    }

    removeFromWorld() {
        Game.gameWorld.removeChild(this);
        removeObjectFromArray(this, Game.hazards);
        Game.gameMap[this.tilePosition.y][this.tilePosition.x].hazard = null;
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