"use strict";

class StarB extends Star {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/star_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.entityType = ENEMY_TYPE.STAR_B;
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.triggered) this.attack();
            else {
                loop: for (let x = -3; x <= 3; x++) {
                    for (let y = -3; y <= 3; y++) {
                        if (!(Math.abs(x) === 3 || Math.abs(y) === 3) || (Math.abs(y) === 2 && Math.abs(x) === 3) || (Math.abs(x) === 2 && Math.abs(y) === 3)) {
                            if (getPlayerOnTile(this.tilePosition.x + x, this.tilePosition.y + y)) {
                                this.triggered = true;
                                break loop;
                            }
                        }
                    }
                }
                if (this.triggered) this.shake();
            }
        } else this.turnDelay--;
    }

    attack() {
        this.triggered = false;
        this.attackTileAtOffset(-2, -2);
        this.attackTileAtOffset(-1, -1);
        this.attackTileAtOffset(2, 2);
        this.attackTileAtOffset(1, 1);
        this.attackTileAtOffset(-2, 2);
        this.attackTileAtOffset(-1, 1);
        this.attackTileAtOffset(2, -2);
        this.attackTileAtOffset(1, -1);
        this.attackTileAtOffset(0, 1);
        this.attackTileAtOffset(1, 0);
        this.attackTileAtOffset(0, -1);
        this.attackTileAtOffset(-1, 0);
        this.turnDelay = 1;
    }
}