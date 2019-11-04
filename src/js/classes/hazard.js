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
        Game.world.addChild(this);
        Game.hazards.push(this);
        Game.map[this.tilePosition.y][this.tilePosition.x].hazard = this;
    }

    removeFromWorld() {
        Game.world.removeChild(this);
        removeObjectFromArray(this, Game.hazards);
        Game.map[this.tilePosition.y][this.tilePosition.x].hazard = null;
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