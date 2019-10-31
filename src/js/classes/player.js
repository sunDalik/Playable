"use strict";

class Player extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 4;
        this.maxhealth = 4;
        this.atk = 1;
        this.STEP_ANIMATION_TIME = 8;
        this.role = ROLE.PLAYER;
    }

    cancelAnimation() {
        super.cancelAnimation();
        scaleGameMap();
    }

    stepX(tileStepX) {
        let tileSize = newTileSizeOnStep(this, tileStepX); //doesnt smoothen anything...why?

        this.tilePosition.x += tileStepX;
        const jumpHeight = tileSize * 25 / 75;
        const a = jumpHeight / ((tileStepX * tileSize / 2) ** 2);
        const b = -(this.position.x + (tileStepX * tileSize) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        const stepX = tileStepX * tileSize / this.STEP_ANIMATION_TIME;
        let counter = 0;

        this.animation = () => {
            this.position.x += stepX;
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            centerCameraX(false);
            counter++;
            if (counter >= this.STEP_ANIMATION_TIME) {
                GameState.APP.ticker.remove(this.animation);
                this.place();
                scaleGameMap();
            }
        };
        GameState.APP.ticker.add(this.animation);
    }

    stepY(tileStepY) {
        let tileSize = newTileSizeOnStep(this, 0, tileStepY);

        this.tilePosition.y += tileStepY;
        let counter = 0;
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

        this.animation = () => {
            x += 1 / this.STEP_ANIMATION_TIME;
            this.position.y = oldPosition + cubicBezier(x, P0, P1, P2, P3) * tileSize * tileStepY;
            centerCameraY(false);
            counter++;
            if (counter >= this.STEP_ANIMATION_TIME) {
                GameState.APP.ticker.remove(this.animation);
                this.place();
                scaleGameMap();
            }
        };
        GameState.APP.ticker.add(this.animation);
    }

    attack(tileRangeX, tileRangeY) {
        const attackTileX = this.tilePosition.x + tileRangeX;
        const attackTileY = this.tilePosition.y + tileRangeY;
        createWeaponAnimation(this.tilePosition.x, this.tilePosition.y, attackTileX, attackTileY);
        attackTile(attackTileX, attackTileY, this.atk, tileRangeX, tileRangeY);
    }

    damage(damage) {
        this.health -= damage;
        redrawHealthForPlayer(this);
    }
}