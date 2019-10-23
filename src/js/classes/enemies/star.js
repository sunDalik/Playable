"use strict";

class Star extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = undefined) {
        if (texture === undefined) {
            super(GameState.resources["src/images/enemies/star.png"].texture, tilePositionX, tilePositionY);
        } else {
            super(texture, tilePositionX, tilePositionY);
        }
        this.health = 100;
        this.triggered = false;
        this.SHAKE_ANIMATION_TIME = 4;
        this.shake();
    }

    move() {

    }

    shake() {
        let counter = 0;
        let star = this;
        let step = GameState.TILESIZE / 20 / (this.SHAKE_ANIMATION_TIME / 2);
        let direction = -1;
        this.animation = function () {
            if (counter < star.SHAKE_ANIMATION_TIME / 2) {
                star.position.x += step * direction;
                counter++;
            } else if (counter < star.SHAKE_ANIMATION_TIME) {
                star.position.x -= step * direction;
                counter++;
            } else {
                counter = 0;
                direction *= -1;
                star.place();
            }
        };
        GameState.APP.ticker.add(this.animation);
    }
}