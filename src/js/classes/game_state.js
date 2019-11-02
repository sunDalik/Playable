"use strict";

class GameState {
}

GameState.APP = null;
GameState.gameWorld = null;
GameState.HUD = null;
GameState.grid = null;
GameState.loader = null;
GameState.resources = null;
GameState.TILESIZE = 65;
GameState.REFERENCE_TILESIZE = GameState.TILESIZE;
GameState.chainLength = 800;
GameState.gameMap = [];
GameState.player = null;
GameState.player2 = null;
GameState.primaryPlayer = null;
GameState.enemies = [];
GameState.hazards = [];
GameState.tiles = [];
GameState.darkTiles = [];
GameState.otherGraphics = [];
GameState.enemiesTimeout = null;
GameState.TURNTIME = 16;
GameState.WEAPON_ATTACK_TIME = 6;
GameState.gameLevel = [];
GameState.playerDetectionGraph = null;
GameState.levelGraph = null;
GameState.startX = 0;
GameState.startY = 0;