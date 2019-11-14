import {STAGE} from "./enums"
import PF from "../../bower_components/pathfinding/pathfinding-browser";

export const Game = {};

Game.APP = null;
Game.loader = null;
Game.resources = null;

Game.world = null;
Game.grid = null;

Game.TILESIZE = 65;
Game.REFERENCE_TILESIZE = Game.TILESIZE;

Game.chainLength = 800;

Game.level = [];
Game.stage = STAGE.FLOODED_CAVE;
Game.map = [];
Game.enemies = [];
Game.hazards = [];
Game.tiles = [];
Game.darkTiles = [];
Game.semiDarkTiles = [];
Game.otherGraphics = [];
Game.infiniteAnimations = [];

Game.normalRooms = null;
Game.statueRooms = null;
Game.obeliskRooms = null;
Game.chestRooms = null;
Game.BGColor = 0xffffff;

Game.player = null;
Game.player2 = null;
Game.startX = 0;
Game.startY = 0;
Game.primaryPlayer = null;
Game.playerMoved = null;

Game.enemiesTimeout = null;
Game.maraudedStatues = [];
Game.weaponPool = [];
Game.magicPool = [];
Game.chestItemPool = [];

Game.TURNTIME = 16;
Game.WEAPON_ATTACK_TIME = 6;
Game.ITEM_FLOAT_ANIMATION_TIME = 90;
Game.SHAKE_TIME = 6;
Game.LONG_SHAKE_TIME = 12;
Game.SHAKE_AMPLITUDE = 50;
Game.SHORT_SHAKE_AMPLITUDE = 35;
Game.shakeAnimation = null;

Game.playerDetectionGraph = null;
Game.levelGraph = null;
Game.finder = new PF.AStarFinder();