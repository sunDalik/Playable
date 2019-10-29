"use strict";

class Spider extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/spider.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 3;
        this.entityType = ENEMY_TYPE.SPIDER;
        this.chase = false;
    }

    move() {
        if (this.chase) {
            let path;
            const path1 = this.getPathToPlayer1();
            const path2 = this.getPathToPlayer2();
            path = path1.length < path2.length ? path1 : path2;
            if (path.length !== 0) {
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;
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