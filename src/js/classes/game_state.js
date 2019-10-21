class GameState {

    static getTS() {
        return this.TILESIZE;
    }
}

GameState.TILESIZE = 75;
GameState.gameMap = [];
GameState.player = null;
GameState.player2 = null;
GameState.enemies = [];