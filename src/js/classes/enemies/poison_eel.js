"use strict";

class PoisonEel extends Eel {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/enemies/eel_poison.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.atk = 1.25;
        this.damaged = false;
        this.triggered = false;
        this.FULL_ROTATE_TIME = 12;
        this.entityType = ENEMY_TYPE.POISON_EEL;
    }

    move() {
        super.move();
    }


    fitToTile() {
        const scaleX = Game.TILESIZE / this.getUnscaledWidth() * 1.05;
        const scaleY = scaleX;
        this.scale.set(scaleX, scaleY);
    }
}


/*
I tried... Didn't work out :(
place() {
    switch (this.angle) {
        case 0:
            this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
            this.position.y = Game.TILESIZE * this.tilePosition.y + Game.TILESIZE - Game.TILESIZE / 65 * 60 + this.height * this.anchor.y;
            break;
        case 90:
            this.position.x = Game.TILESIZE * this.tilePosition.x + Game.TILESIZE * 2 - this.width - Game.TILESIZE / 65 * 75 + this.width * this.anchor.x;
            this.position.y = Game.TILESIZE * this.tilePosition.y + (Game.TILESIZE - this.height) / 2 + this.height * this.anchor.y;
            break;
        case 180:
            this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
            this.position.y = Game.TILESIZE * this.tilePosition.y + Game.TILESIZE * 2 - this.height - Game.TILESIZE / 65 * 70 + this.height * this.anchor.y;
            break;
        case 270:
            this.position.x = Game.TILESIZE * this.tilePosition.x + Game.TILESIZE - Game.TILESIZE / 65 * 55 + this.width * this.anchor.x;
            this.position.y = Game.TILESIZE * this.tilePosition.y + (Game.TILESIZE - this.height) / 2 + this.height * this.anchor.y;
            break;
    }
}
 */