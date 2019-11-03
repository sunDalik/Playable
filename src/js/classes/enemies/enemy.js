"use strict";

class Enemy extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.dead = false;
        this.role = ROLE.ENEMY;
        this.STEP_ANIMATION_TIME = 8;
        this.cancellable = true;
    }

    damage(health) {
        this.health -= health;
        if (this.health <= 0) this.dead = true;
    }

    isDead() {
        return this.dead;
    }

    getPathToPlayer1() {
        const start = Game.levelGraph.grid[this.tilePosition.y][this.tilePosition.x];
        const end = Game.levelGraph.grid[Game.player.tilePosition.y][Game.player.tilePosition.x];
        return astar.search(Game.levelGraph, start, end);
    }

    getPathToPlayer2() {
        const start = Game.levelGraph.grid[this.tilePosition.y][this.tilePosition.x];
        const end = Game.levelGraph.grid[Game.player2.tilePosition.y][Game.player2.tilePosition.x];
        return astar.search(Game.levelGraph, start, end);
    }

    canSeePlayers() {
        const start = Game.playerDetectionGraph.grid[this.tilePosition.y][this.tilePosition.x];
        let end = Game.playerDetectionGraph.grid[Game.player.tilePosition.y][Game.player.tilePosition.x];
        const distanceToPlayer1 = astar.search(Game.playerDetectionGraph, start, end);
        end = Game.playerDetectionGraph.grid[Game.player2.tilePosition.y][Game.player2.tilePosition.x];
        const distanceToPlayer2 = astar.search(Game.playerDetectionGraph, start, end);
        return distanceToPlayer1.length !== 0 || distanceToPlayer2.length !== 0;
    }
}