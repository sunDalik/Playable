"use strict";

class Spider extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/spider.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 3;
        this.entityType = ENEMY_TYPE.SPIDER;
    }

    move() {
    }
}