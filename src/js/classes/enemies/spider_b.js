"use strict";

class SpiderB extends Spider {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/spider_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.health = 3;
        this.entityType = ENEMY_TYPE.SPIDER_B;
    }

    move() {
    }
}