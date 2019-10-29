"use strict";

class SpiderB extends Spider {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/snail_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.health = 2;
        this.entityType = ENEMY_TYPE.SPIDER_B;
    }

    move() {
    }
}