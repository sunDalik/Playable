"use strict";

const ENEMY_TYPE = Object.freeze({ROLLER: 0, ROLLER_B: 1, STAR: 2, STAR_B: 3});
const ROLE = Object.freeze({ENEMY: 0, PLAYER: 1});

class GameState {
}

GameState.APP = null;
GameState.gameWorld = null;
GameState.HUD = null;
GameState.grid = null;
GameState.loader = null;
GameState.resources = null;
GameState.TILESIZE = 75;
GameState.gameMap = [];
GameState.player = null;
GameState.player2 = null;
GameState.enemies = [];
GameState.tiles = []
GameState.enemiesTimeout = null;
GameState.TURNTIME = 16;
GameState.WEAPON_ATTACK_TIME = 8;