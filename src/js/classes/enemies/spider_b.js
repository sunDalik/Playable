"use strict";

class SpiderB extends Spider {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/spider_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.health = 3;
        this.entityType = ENEMY_TYPE.SPIDER_B;
        this.chase = false;
    }

    move() {
        super.move();
    }

    throwAway(throwX, throwY) {
        if (throwX !== 0) {
            if (isNotAWallOrEnemy(this.tilePosition.x + throwX + Math.sign(throwX), this.tilePosition.y)
                && getPlayerOnTile(this.tilePosition.x + throwX + Math.sign(throwX), this.tilePosition.y) === null
                && isNotAWall(this.tilePosition.x + throwX, this.tilePosition.y)) {
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;
                this.stepX(throwX + Math.sign(throwX));
                this.thrown = true;
                this.cancellable = false;
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = this;
            } else if (isNotAWallOrEnemy(this.tilePosition.x + throwX, this.tilePosition.y) && getPlayerOnTile(this.tilePosition.x + throwX, this.tilePosition.y) === null) {
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;
                this.stepX(throwX);
                this.thrown = true;
                this.cancellable = false;
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = this;
            }
        } else if (throwY !== 0) {
            if (isNotAWallOrEnemy(this.tilePosition.x, this.tilePosition.y + throwY + Math.sign(throwY))
                && getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + throwY + Math.sign(throwY)) === null
                && isNotAWall(this.tilePosition.x, this.tilePosition.y + throwY)) {
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;
                this.stepY(throwY + Math.sign(throwY));
                this.thrown = true;
                this.cancellable = false;
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = this;
            } else if (isNotAWallOrEnemy(this.tilePosition.x, this.tilePosition.y + throwY) && getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + throwY) === null) {
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;
                this.stepY(throwY);
                this.thrown = true;
                this.cancellable = false;
                GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = this;
            }
        }
    }
}