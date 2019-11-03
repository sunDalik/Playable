"use strict";

class Game {
}

Game.APP = null;
Game.gameWorld = null;
Game.HUD = null;
Game.HEARTS1 = null;
Game.HEARTS2 = null;
Game.SLOTS1 = null;
Game.SLOTS2 = null;
Game.grid = null;
Game.loader = null;
Game.resources = null;
Game.TILESIZE = 65;
Game.REFERENCE_TILESIZE = Game.TILESIZE;
Game.chainLength = 800;
Game.gameMap = [];
Game.player = null;
Game.player2 = null;
Game.primaryPlayer = null;
Game.playerMoved = null;
Game.enemies = [];
Game.hazards = [];
Game.tiles = [];
Game.darkTiles = [];
Game.otherGraphics = [];
Game.enemiesTimeout = null;
Game.TURNTIME = 16;
Game.WEAPON_ATTACK_TIME = 6;
Game.gameLevel = [];
Game.playerDetectionGraph = null;
Game.levelGraph = null;
Game.startX = 0;
Game.startY = 0;