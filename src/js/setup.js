import * as PIXI from "pixi.js";
import {Game} from "./game";
import {loadAll} from "./loader";
import {Player} from "./classes/player";
import {Knife} from "./classes/equipment/weapons/knife";
import {BasicArmor} from "./classes/equipment/armor/basic_armor";
import * as camera from "./camera";
import {STAGE} from "./enums";
import {generateLevel, getLevelPlayerGraph} from "./level_generation";
import {calculateDetectionGraph, generateMap} from "./map_generation";
import {lightPlayerPosition} from "./drawing/lighting";
import {initPools, setVariablesForStage} from "./game_changer";
import {createDarkness, drawEntities, drawGrid, drawOther, drawTiles} from "./drawing/draw_init";
import {drawHUD} from "./drawing/draw_hud";
import {bindKeys} from "./keyboard/keyboard_binds";
import {HUD} from "./drawing/hud_object";

PIXI.utils.skipHello();
const app = initApplication();
Game.APP = app;
Game.loader = app.loader;
Game.resources = app.loader.resources;
loadAll(setup);

function initApplication() {
    let app = new PIXI.Application({resolution: 2});
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.view);
    return app
}

window.addEventListener("resize", () => {
    Game.APP.renderer.resize(window.innerWidth, window.innerHeight);
});

function setup() {
    Game.world = new PIXI.Container();
    Game.APP.stage.addChild(Game.world);

    Game.HUD = HUD;
    Game.APP.stage.addChild(Game.HUD);
    Game.world.sortableChildren = true;
    Game.APP.stage.sortableChildren = true;

    Game.player = new Player(Game.resources["src/images/player.png"].texture, 0, 0);
    Game.player2 = new Player(Game.resources["src/images/player2.png"].texture, 0, 0);
    Game.player.setStats(0, 0.5, 0, 1.00);
    Game.player2.setStats(0, 1.00, 0, 0.5);
    Game.player2.weapon = new Knife();
    Game.player.armor = new BasicArmor();

    drawHUD();
    bindKeys();
    window.addEventListener("resize", () => {
        drawHUD();
        camera.centerCamera();
    });

    Game.player.zIndex = Game.player2.zIndex + 1;
    Game.primaryPlayer = Game.player;

    Game.stage = STAGE.FLOODED_CAVE;
    initPools();
    setVariablesForStage();
    initializeLevel();
}

export function initializeLevel() {
    let level = generateLevel();
    Game.map = generateMap(level);
    Game.level = level;
    calculateDetectionGraph(Game.map);
    Game.levelGraph = getLevelPlayerGraph(level);

    //dead player visible??? why??
    Game.player.tilePosition.set(Game.startX, Game.startY);
    Game.player2.tilePosition.set(Game.startX + 1, Game.startY + 1);
    Game.player.place();
    Game.player2.place();
    Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].entity = Game.player;
    Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].entity = Game.player2;

    Game.grid = drawGrid();
    drawTiles();
    drawEntities();
    drawHUD();
    drawOther();
    createDarkness();
    lightPlayerPosition(Game.player);
    lightPlayerPosition(Game.player2);
    camera.centerCamera();
}