class PoisonHazard extends Hazard {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/hazards/poison.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.width = Game.TILESIZE;
        this.height = Game.TILESIZE;
        this.LIFETIME = 12;
        this.turnsLeft = this.LIFETIME;
        this.atk = 0.5;
    }
}