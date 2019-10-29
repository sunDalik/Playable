"use strict";

class SnailB extends Snail {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/snail_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.health = 3;
        this.entityType = ENEMY_TYPE.SNAIL_B;
        this.turnDelay = 0;
        this.chase = false;
    }

    move() {
    }
}