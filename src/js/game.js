import {STAGE} from "./enums";

export const Game = {};
Game.app = null;
Game.loader = null;
Game.resources = null;

Game.world = null;

Game.TILESIZE = 66;
//Game.TILESIZE = 25;

Game.followMode = false;
Game.chainLength = 10;

Game.stage = STAGE.FLOODED_CAVE;
Game.map = [];
Game.enemies = [];
Game.hazards = [];
Game.inanimates = [];
Game.updateList = [];
Game.delayList = [];
Game.bullets = [];

Game.darkTiles = [];
Game.infiniteAnimations = [];

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
Game.ITEM_FLOAT_ANIMATION_TIME = 50;
Game.SHAKE_TIME = 6;
Game.SHAKE_AMPLITUDE = 50;
Game.shakeAnimation = null;
Game.itemHelpAnimation = null;
Game.itemHelp = null;

Game.minimap = [];

Game.afterTurn = false;

Game.lightEnergy = 0;
Game.darkEnergy = 0;

Game.obelisks = [];
Game.torchTile = {};

Game.followChain = null;
Game.limitChain = null;

Game.unplayable = true;
Game.paused = false;

Game.endRoomBoundaries = [];
Game.boss = null;
Game.bossFight = false;
Game.bossExit = null;
Game.bossNoDamage = true;
Game.savedTiles = [];

Game.loadingText = null;
Game.loadingTextAnimation = null;
Game.state = null;
Game.keys = [];

Game.showTime = false;
Game.time = 0; //MS
Game.destroyParticles = [];
Game.achievementPopUpQueue = [];

Game.experimentalFeatures = true;
Game.disableMouse = false;
Game.showFPS = false;