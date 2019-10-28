"use strict";

class Player extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.STEP_ANIMATION_TIME = 8;
        this.role = ROLE.PLAYER;
    }

    stepX(tileStepX) {
        this.tilePosition.x += tileStepX;
        const jumpHeight = GameState.TILESIZE * 25 / 75;
        const a = jumpHeight / ((tileStepX * GameState.TILESIZE / 2) ** 2);
        const b = -(this.position.x + (tileStepX * GameState.TILESIZE) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        let counter = 0;
        const stepX = tileStepX * GameState.TILESIZE / this.STEP_ANIMATION_TIME;

        this.animation = () => {
            this.position.x += stepX;
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            centerCameraX();
            counter++;
            if (counter >= this.STEP_ANIMATION_TIME) {
                GameState.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        GameState.APP.ticker.add(this.animation);
        GameState.gameWorld.position.x -= tileStepX * GameState.TILESIZE;
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
            centerCameraY();
            counter++;
            if (counter >= player.STEP_ANIMATION_TIME) {
                GameState.APP.ticker.remove(player.animation);
                player.place();
            }
        };
        GameState.APP.ticker.add(this.animation);
        GameState.gameWorld.position.y -= tileStepY * GameState.TILESIZE;
    }

    attack(tileRangeX, tileRangeY) {
        const attackTileX = this.tilePosition.x + tileRangeX;
        const attackTileY = this.tilePosition.y + tileRangeY;
        createWeaponAnimation(this.tilePosition.x, this.tilePosition.y, attackTileX, attackTileY);
        attackTile(attackTileX, attackTileY);
    }

    damage(damage) {
        this.health -= damage;
    }
}