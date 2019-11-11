"use strict";

class DarkEel extends Eel {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/enemies/eel_dark.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.atk = 1.5;
        this.entityType = ENEMY_TYPE.DARK_EEL;
        this.scaleModifier = 1;
        this.fitToTile();
    }
}