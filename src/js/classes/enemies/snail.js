"use strict";

class Snail extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/snail.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 2;
        this.entityType = ENEMY_TYPE.SNAIL;
        this.turnDelay = 0;
        this.chase = false;
    }

    move() {
    }
}