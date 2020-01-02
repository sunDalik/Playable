import {STAGE} from "./enums";
import PF from "../../bower_components/pathfinding/pathfinding-browser";

export const Game = {};
Game.app = null;
Game.loader = null;
Game.resources = null;

Game.world = null;

Game.TILESIZE = 62;

Game.followMode = false;
Game.chainLength = 10;

Game.level = [];
Game.stage = STAGE.FLOODED_CAVE;
Game.map = [];
Game.enemies = [];
Game.hazards = [];
Game.bullets = [];

Game.darkTiles = [];
Game.infiniteAnimations = [];

Game.normalRooms = null;
Game.statueRooms = null;
Game.obeliskRooms = null;
Game.chestRooms = null;
Game.bossRooms = null;
Game.BGColor = 0xffffff;

Game.player = null; //white player
Game.player2 = null; //black player
Game.BOTH_PLAYERS = {};
Game.startPos = {x: 0, y: 0};
Game.primaryPlayer = null;
Game.lastPlayerMoved = Game.player;
Game.actionsMade = 0;

Game.enemiesTimeout = null;
Game.maraudedStatues = [];
Game.weaponPool = [];
Game.magicPool = [];
Game.chestItemPool = [];

Game.TURNTIME = 15;
Game.WEAPON_ATTACK_TIME = 6;
Game.ITEM_FLOAT_ANIMATION_TIME = 100;
Game.SHAKE_TIME = 6;
Game.LONG_SHAKE_TIME = 12;
Game.SHAKE_AMPLITUDE = 50;
Game.SHORT_SHAKE_AMPLITUDE = 35;
Game.shakeAnimation = null;
Game.itemHelpAnimation = null;
Game.itemHelp = null;

Game.minimap = [];

Game.playerDetectionGraph = null;
Game.levelGraph = null;
Game.finder = new PF.AStarFinder();

Game.afterTurn = false;

Game.lightEnergy = 0;
Game.darkEnergy = 0;

Game.obelisks = [];
Game.torchTile = {};

Game.followChain = null;
Game.limitChain = null;

Game.unplayable = true;
Game.endRoomBoundaries = [];
Game.boss = null;
Game.bossFight = false;
Game.bossExit = false;
Game.savedTiles = [];