"use strict";

class Player extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.STEP_ANIMATION_TIME = 8;
    }

    stepX(tileStepX) {
        this.tilePosition.x += tileStepX;
        const jumpHeight = 25;
        const a = jumpHeight / ((tileStepX * GameState.TILESIZE / 2) ** 2);
        const b = -(this.position.x + (tileStepX * GameState.TILESIZE) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        let counter = 0;
        let player = this;
        const stepX = tileStepX * GameState.TILESIZE / this.STEP_ANIMATION_TIME;

        this.animation = function () {
            player.position.x += stepX;
            player.position.y = a * (player.position.x ** 2) + b * player.position.x + c;
            counter++;
            if (counter >= player.STEP_ANIMATION_TIME) {
                GameState.APP.ticker.remove(player.animation);
                player.place();
            }
        };

        GameState.APP.ticker.add(this.animation);
    }

    stepY(tileStepY) {
        this.tilePosition.y += tileStepY;
        let counter = 0;
        let player = this;
        const oldPosition = this.position.y;
        let x = 0;
        let P0, P1, P2, P3;
        if (tileStepY < 0) {
            P0 = 0.17;
            P1 = 0.89;
            P2 = 0.84;
            P3 = 1.24;
        } else {
            P0 = 0.42;
            P1 = -0.37;
            P2 = 0.97;
            P3 = 0.75;
        }

        this.animation = function () {
            x += 1 / player.STEP_ANIMATION_TIME;
            player.position.y = oldPosition + (Math.pow(1 - x, 3) * P0 + 3 * P1 * Math.pow(1 - x, 2) * x + 3 * P2 * (1 - x) * Math.pow(x, 2) + P3 * Math.pow(x, 3)) * GameState.TILESIZE * tileStepY;
            counter++;
            if (counter >= player.STEP_ANIMATION_TIME) {
                GameState.APP.ticker.remove(player.animation);
                player.place();
            }
        };
        GameState.APP.ticker.add(this.animation);
    }

    damage(damage) {
        this.health -= damage;
    }
}