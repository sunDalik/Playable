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
                if (path[0].y !== this.tilePosition.x) {
                    this.stepX(path[0].y - this.tilePosition.x);
                } else this.stepY(path[0].x - this.tilePosition.y);
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

    getPathToPlayer1() {
        const start = GameState.levelGraph.grid[this.tilePosition.y][this.tilePosition.x];
        const end = GameState.levelGraph.grid[GameState.player.tilePosition.y][GameState.player.tilePosition.x];
        return astar.search(GameState.levelGraph, start, end);
    }

    getPathToPlayer2() {
        const start = GameState.levelGraph.grid[this.tilePosition.y][this.tilePosition.x];
        const end = GameState.levelGraph.grid[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x];
        return astar.search(GameState.levelGraph, start, end);
    }

    canSeePlayers() {
        const start = GameState.levelGraphImpassableEntries.grid[this.tilePosition.y][this.tilePosition.x];
        let end = GameState.levelGraphImpassableEntries.grid[GameState.player.tilePosition.y][GameState.player.tilePosition.x];
        const distanceToPlayer1 = astar.search(GameState.levelGraphImpassableEntries, start, end);
        end = GameState.levelGraphImpassableEntries.grid[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x];
        const distanceToPlayer2 = astar.search(GameState.levelGraphImpassableEntries, start, end);
        console.log(GameState.levelGraphImpassableEntries.grid);
        return distanceToPlayer1.length !== 0 || distanceToPlayer2.length !== 0;
    }
}