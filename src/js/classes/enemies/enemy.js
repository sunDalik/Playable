"use strict";

class Enemy extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 100;
        this.dead = false;
        this.role = ROLE.ENEMY;
    }

    damage(health) {
        this.health -= health;
        if (this.health <= 0) this.dead = true;
    }

    isDead() {
        return this.dead;
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
        return distanceToPlayer1.length !== 0 || distanceToPlayer2.length !== 0;
    }
}