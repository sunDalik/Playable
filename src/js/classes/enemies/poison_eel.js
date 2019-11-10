"use strict";

class PoisonEel extends Eel {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/enemies/eel_poison.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.atk = 1.25;
        this.damaged = false;
        this.triggered = false;
        this.entityType = ENEMY_TYPE.POISON_EEL;
    }
}