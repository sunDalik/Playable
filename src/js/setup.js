import * as PIXI from "pixi.js";
import {Game} from "./game";
import {camera} from "./classes/game/camera";
import {loadAll} from "./loader";
import {ACHIEVEMENT_ID, GAME_STATE, PLAY_MODE, STAGE, STORAGE, TILE_TYPE} from "./enums/enums";
import {generateLevel} from "./level_generation/level_generation";
import {assignDrops} from "./map_generation";
import {lightPlayerPosition, lightPosition, lightTile} from "./drawing/lighting";
import {initPools, replaceStageWithAlt, setVariablesForStage} from "./game_changer";
import {createDarkness, drawEntities, drawGrid, drawOther, drawTiles} from "./drawing/draw_init";
import {drawHUD, drawInteractionKeys, drawMovementKeyBindings, setTimerRunning} from "./drawing/draw_hud";
import {bindKeys} from "./keyboard/keyboard_binds";
import {HUD, movePlayerHudToContainer} from "./drawing/hud_object";
import {randomChoice} from "./utils/random_utils";
import {get8Directions, get8DirectionsWithoutItems, getCardinalDirectionsWithoutItems} from "./utils/map_utils";
import {cleanGameState, kiss, swapEquipmentWithPlayer} from "./game_logic";
import {World} from "./classes/game/world";
import {setTickTimeout} from "./utils/game_utils";
import {closeBlackBars, retreatBlackBars, showStageTitle} from "./drawing/hud_animations";
import {Torch} from "./classes/equipment/tools/torch";
import {redrawPauseBG, setupSuperHud, SUPER_HUD} from "./drawing/super_hud";
import {removeAllObjectsFromArray} from "./utils/basic_utils";
import {DEATH_FILTER} from "./filters";
import {drawMiniMap} from "./drawing/minimap";
import {HUDTextStyleTitle} from "./drawing/draw_constants";
import {setupMenu} from "./menu/main_menu";
import {WhitePlayer} from "./classes/players/player_white";
import {BlackPlayer} from "./classes/players/player_black";
import {TutorialPlayerWhite} from "./tutorial/tutorial_player_white";
import {TutorialPlayerBlack} from "./tutorial/tutorial_player_black";

PIXI.utils.skipHello();
initLocalStorage();
Game.app = initApplication();
Game.loader = Game.app.loader;
Game.resources = Game.app.loader.resources;
Game.app.stage.sortableChildren = true;
Game.app.stage.addChild(SUPER_HUD);
createLoadingText();

export function createLoadingText() {
    if (Game.loadingText) Game.app.stage.removeChild(Game.loadingText);
    if (Game.loadingTextAnimation) Game.app.ticker.remove(Game.loadingTextAnimation);
    Game.loadingText = new PIXI.Text("Loading...", HUDTextStyleTitle);
    Game.app.stage.addChild(Game.loadingText);
    Game.loadingText.anchor.set(0.5, 0.5);
    Game.loadingText.position.set(Game.app.renderer.screen.width / 2, 200);
    let counter = 0;
    const loadingTextAnimation = delta => {
        counter += delta;
        if (counter > 20) {
            counter = 0;
            if (Game.loadingText.text === "Loading.") Game.loadingText.text = "Loading..";
            else if (Game.loadingText.text === "Loading..") Game.loadingText.text = "Loading...";
            else if (Game.loadingText.text === "Loading...") Game.loadingText.text = "Loading.";
        }
    };
    Game.loadingTextAnimation = loadingTextAnimation;
    Game.app.ticker.add(loadingTextAnimation);
}

loadAll(setupMenu);

function initApplication() {
    PIXI.settings.RESOLUTION = 2;
    const app = new PIXI.Application();
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.view);
    return app;
}

window.addEventListener("resize", () => {
    Game.app.renderer.resize(window.innerWidth, window.innerHeight);
});

export function setupGame() {
    if (Game.loadingText) Game.app.stage.removeChild(Game.loadingText);
    if (Game.loadingTextAnimation) Game.app.ticker.remove(Game.loadingTextAnimation);
    if (false) {
        Game.TILESIZE = 80;
        HUD.visible = false;
    }
    Game.state = GAME_STATE.PLAYING;
    Game.world = new World();
    Game.app.stage.addChild(Game.world);
    Game.app.stage.addChild(HUD);
    setupSuperHud();
    initPlayers();
    bindKeys();
    window.addEventListener("resize", () => {
        drawHUD();
        camera.center();
        drawMiniMap();
    });

    initGameState();
    drawHUD();
    initPools();
    initializeLevel();
    //test();
    //Game.world.scale.set(0.5, 0.5); //it works!
    //camera.center();
}

export function initializeLevel() {
    setVariablesForStage();
    Game.map = generateLevel();
    if (!Game.player.dead) {
        Game.player.tilePosition.set(Game.startPos.x, Game.startPos.y);
        Game.player.place();
        Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].entity = Game.player;
        Game.player.correctZIndex();
    }
    if (!Game.player2.dead) {
        if (Game.player.dead) {
            Game.player2.tilePosition.set(Game.startPos.x, Game.startPos.y);
        } else {
            let startPlace;
            //Game.followMode isn't used anymore though...
            if (Game.followMode) startPlace = randomChoice(getCardinalDirectionsWithoutItems(Game.player));
            else startPlace = randomChoice(get8DirectionsWithoutItems(Game.player));
            Game.player2.tilePosition.set(Game.player.tilePosition.x + startPlace.x, Game.player.tilePosition.y + startPlace.y);
        }
        Game.player2.place();
        Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].entity = Game.player2;
        Game.player2.correctZIndex();
    }
    drawInteractionKeys();
    drawMovementKeyBindings();

    drawGrid();
    drawTiles();
    drawEntities();
    createDarkness();
    for (const enemy of Game.enemies.concat(Game.inanimates)) {
        if (enemy.afterMapGen) enemy.afterMapGen();
    }
    drawOther();
    drawMiniMap();
    if (!Game.player.dead) lightPlayerPosition(Game.player);
    if (!Game.player2.dead) lightPlayerPosition(Game.player2);
    if (Game.stage === STAGE.DARK_TUNNEL) {
        lightPosition(Game.torchTile, Game.map[Game.torchTile.y][Game.torchTile.x].item.item.lightSpread, true);
    }
    camera.center();

    if (Game.playMode !== PLAY_MODE.TUTORIAL) assignDrops();
    retreatBlackBars();
    setTickTimeout(() => {
        if (Math.random() < 0 && !Game.player.dead && !Game.player2.dead && Game.stage !== STAGE.FLOODED_CAVE) {
            Game.player.microSlide(Game.player2.tilePosition.x - Game.player.tilePosition.x,
                Game.player2.tilePosition.y - Game.player.tilePosition.y,
                null, () => setTickTimeout(() =>
                    Game.player.microSlide(0, 0, null, () => Game.unplayable = false, 5, 2.5), 11),
                10, 2.5);
            Game.player2.microSlide(Game.player.tilePosition.x - Game.player2.tilePosition.x,
                Game.player.tilePosition.y - Game.player2.tilePosition.y,
                null, () => setTickTimeout(() =>
                    Game.player2.microSlide(0, 0, null, () => Game.unplayable = false, 5, 2.5), 11),
                10, 2.5);
            kiss();
        } else Game.unplayable = false;

        showStageTitle();
    }, 8);

    if (Game.stage === STAGE.RUINS) {
        //lightAll();
    }
    if (false) {
        lightAllRealistic();
        camera.setup(Game.world.width / 2, Game.world.height / 2);
    }
    setTimerRunning(false);
}

function initPlayers() {
    if (Game.playMode === PLAY_MODE.TUTORIAL) {
        Game.player = new TutorialPlayerWhite(1, 1);
        Game.player2 = new TutorialPlayerBlack(1, 1);
    } else {
        Game.player = new WhitePlayer(1, 1);
        Game.player2 = new BlackPlayer(1, 1);
    }
    Game.primaryPlayer = Game.player;
    Game.lastPlayerMoved = Game.player;
}

export function retry() {
    if (Game.loadingText) Game.app.stage.removeChild(Game.loadingText);
    if (Game.loadingTextAnimation) Game.app.ticker.remove(Game.loadingTextAnimation);
    closeBlackBars(() => {
        removeAllObjectsFromArray(DEATH_FILTER, Game.world.filters);
        removeAllObjectsFromArray(DEATH_FILTER, HUD.filters);

        SUPER_HUD.gameOverScreen.visible = false;
        SUPER_HUD.killedBys.map(k => SUPER_HUD.removeChild(k));
        Game.world.visible = true;
        HUD.visible = true;
        Game.world.clean();
        cleanGameState();
        initPlayers();
        initGameState();
        redrawPauseBG();
        drawHUD();
        bindKeys();
        initPools();
        initializeLevel();
        Game.state = GAME_STATE.PLAYING;
    });
}

function initGameState() {
    Game.stage = STAGE.MARBLE_MAUSOLEUM;
    if (Game.playMode !== PLAY_MODE.TUTORIAL) replaceStageWithAlt();
    Game.time = 0;
    Game.keysAmount = 0;
    Game.enemiesKilled = 0;
    Game.turns = 0;
    Game.gameOver = false;

    //otherwise players will have no shadow if you start on dt...
    Game.player.regenerateShadow();
    Game.player2.regenerateShadow();
    movePlayerHudToContainer(HUD);
}

function test() {
    lightAll();
    if (Game.stage === STAGE.DARK_TUNNEL) swapEquipmentWithPlayer(Game.player, new Torch(), false);
    camera.setup(Game.world.width / 2, Game.world.height / 2);
}

function lightAll() {
    for (let i = 0; i < Game.map.length; i++) {
        for (let j = 0; j < Game.map[0].length; j++) {
            if (Game.map[i][j].tileType !== TILE_TYPE.VOID)
                lightTile(j, i);
        }
    }
}

function lightAllRealistic() {
    for (let i = 1; i < Game.map.length - 1; i++) {
        for (let j = 1; j < Game.map[0].length - 1; j++) {
            if ([TILE_TYPE.WALL, TILE_TYPE.SUPER_WALL].includes(Game.map[i][j].tileType)) {
                for (const dir of get8Directions()) {
                    if (![TILE_TYPE.WALL, TILE_TYPE.SUPER_WALL].includes(Game.map[i + dir.y][j + dir.x].tileType)) {
                        lightTile(j, i);
                    }
                }
            } else lightTile(j, i);
        }
    }
}

function lightRandom() {
    for (let i = 0; i < Game.map.length; i++) {
        for (let j = 0; j < Game.map[0].length; j++) {
            if (Math.random() < 0.3 && Game.map[i][j].tileType !== TILE_TYPE.VOID)
                lightTile(j, i);
        }
    }
}

function initLocalStorage(reset = false) {
    initLocalStorageKeys(reset);
    initLocalStorageOther(reset);
    initLocalStorageAchievements(reset);
    initLocalStorageStages(reset);
    setupSettingsFromLocalStorage();
}

export function initLocalStorageKeys(reset = false) {
    if (reset || !window.localStorage[STORAGE.KEY_MOVE_UP_1P]) window.localStorage[STORAGE.KEY_MOVE_UP_1P] = "KeyW";
    if (reset || !window.localStorage[STORAGE.KEY_MOVE_LEFT_1P]) window.localStorage[STORAGE.KEY_MOVE_LEFT_1P] = "KeyA";
    if (reset || !window.localStorage[STORAGE.KEY_MOVE_DOWN_1P]) window.localStorage[STORAGE.KEY_MOVE_DOWN_1P] = "KeyS";
    if (reset || !window.localStorage[STORAGE.KEY_MOVE_RIGHT_1P]) window.localStorage[STORAGE.KEY_MOVE_RIGHT_1P] = "KeyD";

    if (reset || !window.localStorage[STORAGE.KEY_MOVE_UP_2P]) window.localStorage[STORAGE.KEY_MOVE_UP_2P] = "KeyI";
    if (reset || !window.localStorage[STORAGE.KEY_MOVE_LEFT_2P]) window.localStorage[STORAGE.KEY_MOVE_LEFT_2P] = "KeyJ";
    if (reset || !window.localStorage[STORAGE.KEY_MOVE_DOWN_2P]) window.localStorage[STORAGE.KEY_MOVE_DOWN_2P] = "KeyK";
    if (reset || !window.localStorage[STORAGE.KEY_MOVE_RIGHT_2P]) window.localStorage[STORAGE.KEY_MOVE_RIGHT_2P] = "KeyL";

    if (reset || !window.localStorage[STORAGE.KEY_MAGIC_1_1P]) window.localStorage[STORAGE.KEY_MAGIC_1_1P] = "Digit1";
    if (reset || !window.localStorage[STORAGE.KEY_MAGIC_2_1P]) window.localStorage[STORAGE.KEY_MAGIC_2_1P] = "Digit2";
    if (reset || !window.localStorage[STORAGE.KEY_MAGIC_3_1P]) window.localStorage[STORAGE.KEY_MAGIC_3_1P] = "Digit3";

    if (reset || !window.localStorage[STORAGE.KEY_MAGIC_1_2P]) window.localStorage[STORAGE.KEY_MAGIC_1_2P] = "Digit8";
    if (reset || !window.localStorage[STORAGE.KEY_MAGIC_2_2P]) window.localStorage[STORAGE.KEY_MAGIC_2_2P] = "Digit9";
    if (reset || !window.localStorage[STORAGE.KEY_MAGIC_3_2P]) window.localStorage[STORAGE.KEY_MAGIC_3_2P] = "Digit0";

    if (reset || !window.localStorage[STORAGE.KEY_WEAPON_1P]) window.localStorage[STORAGE.KEY_WEAPON_1P] = "KeyQ";
    if (reset || !window.localStorage[STORAGE.KEY_WEAPON_2P]) window.localStorage[STORAGE.KEY_WEAPON_2P] = "KeyU";
    if (reset || !window.localStorage[STORAGE.KEY_EXTRA_1P]) window.localStorage[STORAGE.KEY_EXTRA_1P] = "KeyE";
    if (reset || !window.localStorage[STORAGE.KEY_EXTRA_2P]) window.localStorage[STORAGE.KEY_EXTRA_2P] = "KeyO";
    if (reset || !window.localStorage[STORAGE.KEY_BAG_1P]) window.localStorage[STORAGE.KEY_BAG_1P] = "KeyF";
    if (reset || !window.localStorage[STORAGE.KEY_BAG_2P]) window.localStorage[STORAGE.KEY_BAG_2P] = "KeyH";

    if (reset || !window.localStorage[STORAGE.KEY_Z_SWITCH]) window.localStorage[STORAGE.KEY_Z_SWITCH] = "KeyZ";
    if (reset || !window.localStorage[STORAGE.KEY_MAP]) window.localStorage[STORAGE.KEY_MAP] = "KeyM";
    if (reset || !window.localStorage[STORAGE.KEY_PAUSE]) window.localStorage[STORAGE.KEY_PAUSE] = "Escape";
}

export function initLocalStorageOther(reset = false) {
    //use JSON.parse to parse string boolean values
    if (reset || !window.localStorage[STORAGE.SHOW_TIME]) window.localStorage[STORAGE.SHOW_TIME] = false;
    if (reset || !window.localStorage[STORAGE.DISABLE_MOUSE]) window.localStorage[STORAGE.DISABLE_MOUSE] = false;
    if (reset || !window.localStorage[STORAGE.SHOW_FPS]) window.localStorage[STORAGE.SHOW_FPS] = false;
}

export function initLocalStorageAchievements(reset = false) {
    if (reset || !window.localStorage[STORAGE.ACHIEVEMENTS]) {
        const achievementsArray = [];
        for (const id of Object.values(ACHIEVEMENT_ID)) {
            achievementsArray[id] = 0;
        }
        window.localStorage[STORAGE.ACHIEVEMENTS] = JSON.stringify(achievementsArray);
    } else {
        // fill in missing achievements
        const achievements = JSON.parse(window.localStorage[STORAGE.ACHIEVEMENTS]);
        for (const id of Object.values(ACHIEVEMENT_ID)) {
            if (achievements[id] !== 0 && achievements[id] !== 1) achievements[id] = 0;
        }
        window.localStorage[STORAGE.ACHIEVEMENTS] = JSON.stringify(achievements);
    }
}

export function initLocalStorageStages(reset = false) {
    if (reset || !window.localStorage[STORAGE.STAGES_TIMES_BEATEN]) {
        const stagesArray = [];
        for (const stage of Object.values(STAGE)) {
            stagesArray[stage.id] = 0;
        }
        window.localStorage[STORAGE.STAGES_TIMES_BEATEN] = JSON.stringify(stagesArray);
    } else {
        // fill in missing stages
        const stagesArray = JSON.parse(window.localStorage[STORAGE.STAGES_TIMES_BEATEN]);
        for (const stage of Object.values(STAGE)) {
            if (!Number.isInteger(stagesArray[stage.id])) stagesArray[stage.id] = 0;
        }
        window.localStorage[STORAGE.STAGES_TIMES_BEATEN] = JSON.stringify(stagesArray);
    }
}

function setupSettingsFromLocalStorage() {
    Game.showTime = JSON.parse(window.localStorage[STORAGE.SHOW_TIME]);
    Game.showFPS = JSON.parse(window.localStorage[STORAGE.SHOW_FPS]);
    Game.disableMouse = JSON.parse(window.localStorage[STORAGE.DISABLE_MOUSE]);
    setMousePrivileges();
}

export function setMousePrivileges() {
    if (Game.disableMouse) {
        document.body.style.cursor = 'none';
        for (const button of Game.buttons) {
            button.buttonMode = false;
            button.interactive = false;
        }
    } else {
        document.body.style.cursor = 'auto';
        for (const button of Game.buttons) {
            button.buttonMode = true;
            button.interactive = true;
        }
    }
}

// returns how many times a stage has been beaten
export function stageBeaten(stage) {
    const stagesArray = JSON.parse(window.localStorage[STORAGE.STAGES_TIMES_BEATEN]);
    return stagesArray[stage.id];
}