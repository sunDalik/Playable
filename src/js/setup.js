import * as PIXI from "pixi.js";
import {Game} from "./game";
import {camera} from "./classes/game/camera";
import {loadAll} from "./loader";
import {Player} from "./classes/player";
import {Knife} from "./classes/equipment/weapons/knife";
import {BasicArmor} from "./classes/equipment/armor/basic";
import {STAGE} from "./enums";
import {generateLevel} from "./level_generation/level_generation";
import {assignDrops, calculateDetectionGraph, generateMap} from "./map_generation";
import {lightPlayerPosition, lightPosition, lightTile} from "./drawing/lighting";
import {initPools, setVariablesForStage} from "./game_changer";
import {createDarkness, drawEntities, drawGrid, drawOther, drawTiles} from "./drawing/draw_init";
import {drawHUD, drawInteractionKeys, drawMovementKeyBindings} from "./drawing/draw_hud";
import {bindKeys} from "./keyboard/keyboard_binds";
import {HUD} from "./drawing/hud_object";
import {randomChoice} from "./utils/random_utils";
import {get8DirectionsWithoutItems, getCardinalDirectionsWithoutItems} from "./utils/map_utils";
import {cleanGameState, kiss, swapEquipmentWithPlayer} from "./game_logic";
import {World} from "./classes/game/world";
import {setTickTimeout} from "./utils/game_utils";
import {closeBlackBars, retreatBlackBars} from "./drawing/hud_animations";
import {getLevelPlayerGraph} from "./level_generation/generation_utils";
import {Torch} from "./classes/equipment/tools/torch";
import {SUPER_HUD} from "./drawing/super_hud";
import {removeObjectFromArray} from "./utils/basic_utils";
import {DEATH_FILTER, GAME_OVER_BLUR_FILTER} from "./filters";
import {drawMiniMap} from "./drawing/minimap";

PIXI.utils.skipHello();
Game.app = initApplication();
Game.loader = Game.app.loader;
Game.resources = Game.app.loader.resources;
loadAll(setup);

function initApplication() {
    PIXI.settings.RESOLUTION = 2;
    const app = new PIXI.Application();
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.view);
    return app
}

window.addEventListener("resize", () => {
    Game.app.renderer.resize(window.innerWidth, window.innerHeight);
});

function setup() {
    Game.world = new World();
    Game.app.stage.addChild(Game.world);
    Game.app.stage.addChild(HUD);
    Game.app.stage.addChild(SUPER_HUD);
    Game.app.stage.sortableChildren = true;
    initPlayers();
    drawHUD();
    bindKeys();
    window.addEventListener("resize", () => {
        drawHUD();
        camera.center();
        drawMiniMap();
    });

    //Game.TILESIZE = 13;
    Game.stage = STAGE.FLOODED_CAVE;
    initPools();
    initializeLevel();
    //test();
    //Game.world.scale.set(0.5, 0.5); //it works!
    //camera.center()();
}

export function initializeLevel() {
    setVariablesForStage();
    const level = generateLevel();
    Game.map = generateMap(level);
    Game.level = level;
    calculateDetectionGraph(Game.map);
    Game.levelGraph = getLevelPlayerGraph(level);
    if (!Game.player.dead) {
        Game.player.tilePosition.set(Game.startPos.x, Game.startPos.y);
        Game.player.place();
        Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].entity = Game.player;
    }
    if (!Game.player2.dead) {
        if (Game.player.dead) {
            Game.player2.tilePosition.set(Game.startPos.x, Game.startPos.y);
        } else {
            let startPlace;
            if (Game.followMode) startPlace = randomChoice(getCardinalDirectionsWithoutItems(Game.player));
            else startPlace = randomChoice(get8DirectionsWithoutItems(Game.player));
            Game.player2.tilePosition.set(Game.player.tilePosition.x + startPlace.x, Game.player.tilePosition.y + startPlace.y);
        }
        Game.player2.place();
        Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].entity = Game.player2;
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

    assignDrops();
    retreatBlackBars();
    setTickTimeout(() => {
        if (Math.random() < 0.5 && !Game.player.dead && !Game.player2.dead && Game.stage !== STAGE.FLOODED_CAVE) {
            Game.player.microSlide(Game.player2.tilePosition.x - Game.player.tilePosition.x,
                Game.player2.tilePosition.y - Game.player.tilePosition.y,
                null, () => setTickTimeout(() =>
                    Game.player.microSlide(0, 0, null, () => Game.unplayable = false, 5, 2), 11),
                10, 2);
            Game.player2.microSlide(Game.player.tilePosition.x - Game.player2.tilePosition.x,
                Game.player.tilePosition.y - Game.player2.tilePosition.y,
                null, () => setTickTimeout(() =>
                    Game.player2.microSlide(0, 0, null, () => Game.unplayable = false, 5, 2), 11),
                10, 2);
            kiss();
        } else Game.unplayable = false;
    }, 8, 2);

    if (Game.stage === STAGE.RUINS) {
        lightAll();
    }
}

function initPlayers() {
    Game.player = new Player(Game.resources["src/images/player.png"].texture, 0, 0);
    Game.player2 = new Player(Game.resources["src/images/player2.png"].texture, 0, 0);
    Game.player.setStats(0, 0.5, 0, 1.00);
    Game.player2.setStats(0, 1.00, 0, 0.5);
    Game.player2.weapon = new Knife();
    Game.player.weapon = new Knife();
    Game.player.armor = new BasicArmor();

    Game.player2.zIndex = 1;
    Game.player.zIndex = Game.player2.zIndex + 2;
    Game.primaryPlayer = Game.player;
    Game.lastPlayerMoved = Game.player;

    Game.darkEnergy = 0;
    Game.lightEnergy = 0;
}

export function retry() {
    closeBlackBars(retryAfterBlackBars);
}

function retryAfterBlackBars() {
    for (let i = 0; i < 2; i++) {
        //two times. In case two players die simultaneously
        removeObjectFromArray(DEATH_FILTER, Game.world.filters);
        removeObjectFromArray(DEATH_FILTER, HUD.filters);
        removeObjectFromArray(GAME_OVER_BLUR_FILTER, Game.world.filters);
        removeObjectFromArray(GAME_OVER_BLUR_FILTER, HUD.filters);
    }

    SUPER_HUD.gameOverScreen.visible = false;

    Game.world.clean();
    cleanGameState();
    initPlayers();
    drawHUD();
    bindKeys();
    Game.stage = STAGE.FLOODED_CAVE;
    initPools();
    initializeLevel();
}

function test() {
    lightAll();
    if (Game.stage === STAGE.DARK_TUNNEL) swapEquipmentWithPlayer(Game.player, new Torch(), false);
    camera.setup(Game.world.width / 2, Game.world.height / 2);
}

function lightAll() {
    for (let i = 0; i < Game.map.length; i++) {
        for (let j = 0; j < Game.map[0].length; j++) {
            lightTile(j, i);
        }
    }
}