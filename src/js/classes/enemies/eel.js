"use strict";

class Eel extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/enemies/eel.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.atk = 1;
        this.SWIM_ANIMATION_TIME = 10;
        this.entityType = ENEMY_TYPE.EEL;
    }

    move() {
        let counter = 0;

    }
}