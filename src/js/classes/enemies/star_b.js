"use strict";

class StarB extends Star {
    constructor(tilePositionX = 0, tilePositionY = 0) {
        super(tilePositionX, tilePositionY, GameState.resources["src/images/enemies/star_b.png"].texture);
        this.health = 100;
    }

    move() {

    }

}