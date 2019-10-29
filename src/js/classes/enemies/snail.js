"use strict";

class Snail extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/snail.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 2;
        this.entityType = ENEMY_TYPE.SNAIL;
        this.turnDelay = 0;
        this.chase = false;
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.chase) {
                this.turnDelay = 1;
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;

                let path;
                const path1 = this.getPathToPlayer1();
                const path2 = this.getPathToPlayer2();
                path = path1.length < path2.length ? path1 : path2;
                if (path.length !== 0) {
                    if (path[0].y !== this.tilePosition.x) {
                        this.stepX(path[0].y - this.tilePosition.x);
                    } else this.stepY(path[0].x - this.tilePosition.y);
                    GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = this;
                }
            } else {
                if (this.canSeePlayers()) {
                    this.chase = true;
                    this.move();
                }
            }
        } else this.turnDelay--;
    }

    stepX(tileStepX) {
        this.tilePosition.x += tileStepX;
        this.place();
    }

    stepY(tileStepY) {
        this.tilePosition.y += tileStepY;
        this.place();
    }


}