"use strict";

class StarB extends Star {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/star_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.health = 100;
    }

    move() {
        if (this.triggered) this.attack();
        else {
            loop: for (let x = 0; x <= 3; x++) {
                for (let y = 0; y <= 3; y++) {
                    for (let signX = -1; signX <= 1; signX += 2) {
                        for (let signY = -1; signY <= 1; signY += 2) {
                            if (!(x === 3 && y === 3) && Math.abs(x - y) <= 1) {
                                if (getPlayerOnTile(this.tilePosition.x + x * signX, this.tilePosition.y + y * signY)) {
                                    this.triggered = true;
                                    break loop;
                                }
                            }
                        }
                    }
                }
            }
            if (this.triggered) this.shake();
        }
    }

}