import {STAGE} from "./enums/enums";

export const Game = {
    app: null,
    loader: null,
    resources: null,

    world: null,

    TILESIZE: 66,
    //TILESIZE : 25,

    followMode: false,
    chainLength: 10,

    stage: STAGE.FLOODED_CAVE,
    map: [],
    enemies: [],
    hazards: [],
    inanimates: [],
    updateList: [],
    delayList: [],
    bullets: [],

    darkTiles: [],
    infiniteAnimations: [],

    BGColor: 0xffffff,
    player: null, //white player
    player2: null, //black player
    BOTH_PLAYERS: {},
    startPos: {x: 0, y: 0},
    primaryPlayer: null,
    lastPlayerMoved: null,
    actionsMade: 0,

    enemiesTimeout: null,
    weaponPool: [],
    magicPool: [],
    chestItemPool: [],

    TURNTIME: 15,
    ITEM_FLOAT_ANIMATION_TIME: 50,
    itemHelpAnimation: null,
    itemHelp: null,

    minimap: [],

    afterTurn: false,

    obelisks: [],
    torchTile: {},

    followChain: null,
    limitChain: null,

    unplayable: true,
    paused: false,

    endRoomBoundaries: [],
    boss: null,
    bossFight: false,
    bossExit: null,
    bossNoDamage: true,
    savedTiles: [],

    loadingText: null,
    loadingTextAnimation: null,
    state: null,
    keys: [],

    showTime: false,
    time: 0, //MS
    turns: 0,
    destroyParticles: [],
    achievementPopUpQueue: [],

    disableMouse: false,
    showFPS: false,
    keysAmount: 0,
    enemiesKilled: 0
};