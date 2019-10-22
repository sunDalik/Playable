"use strict";

class GameState {

    static getTS() {
        return this.TILESIZE;
    }
}

GameState.APP = null;
GameState.TILESIZE = 75;
GameState.gameMap = [];
GameState.player = null;
GameState.player2 = null;
GameState.enemies = [];
GameState.enemiesTimeout = null;
GameState.TURNTIME = 16;