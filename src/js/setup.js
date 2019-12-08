import * as PIXI from "pixi.js";
import {Game} from "./game";
import {loadAll} from "./loader";
import {Player} from "./classes/player";
import {Knife} from "./classes/equipment/weapons/knife";
import {BasicArmor} from "./classes/equipment/armor/basic";
import * as camera from "./camera";
import {redrawTiles} from "./camera";
import {STAGE} from "./enums";
import {generateLevel, getLevelPlayerGraph} from "./level_generation";
import {calculateDetectionGraph, generateMap} from "./map_generation";
import {lightPlayerPosition, lightPosition, lightTile} from "./drawing/lighting";
import {initPools, setVariablesForStage} from "./game_changer";
import {createDarkness, drawEntities, drawGrid, drawOther, drawTiles} from "./drawing/draw_init";
import {drawHUD, drawInteractionKeys, drawMovementKeyBindings} from "./drawing/draw_hud";
import {bindKeys} from "./keyboard/keyboard_binds";
import {HUD} from "./drawing/hud_object";
import {randomChoice} from "./utils/random_utils";
import {get8DirectionsWithoutItems} from "./utils/map_utils";
import {kiss} from "./game_logic";
import {setTickTimeout} from "./utils/basic_utils";
import {World} from "./classes/game/world";

PIXI.utils.skipHello();
Game.app = initApplication();
Game.loader = Game.app.loader;
Game.resources = Game.app.loader.resources;
loadAll(setup);

function initApplication() {
    const app = new PIXI.Application({resolution: 2});
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

    Game.HUD = HUD;
    Game.app.stage.addChild(Game.HUD);
    Game.world.sortableChildren = true;
    Game.app.stage.sortableChildren = true;

    Game.player = new Player(Game.resources["src/images/player.png"].texture, 0, 0);
    Game.player2 = new Player(Game.resources["src/images/player2.png"].texture, 0, 0);
    Game.player.setStats(0, 0.5, 0, 1.00);
    Game.player2.setStats(0, 1.00, 0, 0.5);
    Game.player2.weapon = new Knife();
    Game.player.armor = new BasicArmor();

    Game.player.zIndex = 1;
    Game.player2.zIndex = Game.player.zIndex + 1;
    Game.primaryPlayer = Game.player2;
    Game.lastPlayerMoved = Game.player;

    drawHUD();
    bindKeys();
    window.addEventListener("resize", () => {
        drawHUD();
        camera.centerCamera();
    });

    Game.stage = STAGE.FLOODED_CAVE;
    initPools();
    initializeLevel();
}

export function initializeLevel() {
    setVariablesForStage();
    const level = generateLevel();
    Game.map = generateMap(level);
    Game.level = level;
    calculateDetectionGraph(Game.map);
    Game.levelGraph = getLevelPlayerGraph(level);

    if (!Game.player.dead) {
        if (!Game.player.carried) {
            Game.player.tilePosition.set(Game.startX, Game.startY);
            Game.player.place();
            Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].entity = Game.player;
        }
        if (Game.player2.carried) {
            Game.player2.tilePosition.set(Game.player.tilePosition.x, Game.player.tilePosition.y);
            Game.player2.place();
            Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].secondaryEntity = Game.player2;
        }
    }
    if (!Game.player2.dead) {
        if (!Game.player2.carried) {
            if (Game.player.carried)
                Game.player2.tilePosition.set(Game.startX, Game.startY);
            else {
                if (Game.player.dead) {
                    Game.player.tilePosition.set(Game.startX, Game.startY);
                } else {
                    const startPlace = randomChoice(get8DirectionsWithoutItems(Game.player));
                    Game.player2.tilePosition.set(Game.player.tilePosition.x + startPlace.x, Game.player.tilePosition.y + startPlace.y);
                }
            }
            Game.player2.place();
            Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].entity = Game.player2;
        }
        if (Game.player.carried) {
            Game.player.tilePosition.set(Game.player2.tilePosition.x, Game.player2.tilePosition.y);
            Game.player.place();
            Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].secondaryEntity = Game.player;
        }
    }
    drawInteractionKeys();
    drawMovementKeyBindings();

    Game.grid = drawGrid();
    drawTiles();
    drawEntities();
    for (const enemy of Game.enemies) {
        if (enemy.afterMapGen) enemy.afterMapGen();
    }
    drawOther();
    createDarkness();
    if (!Game.player.dead) lightPlayerPosition(Game.player);
    if (!Game.player2.dead) lightPlayerPosition(Game.player2);
    if (Game.stage === STAGE.DARK_TUNNEL) {
        lightPosition(Game.torchTile, Game.map[Game.torchTile.y][Game.torchTile.x].item.item.lightSpread, true);
    }
    camera.centerCamera();

    setTickTimeout(() => {
        if (Math.random() < 0.5 && !Game.player.dead && !Game.player2.dead && Game.stage !== STAGE.FLOODED_CAVE) {
            Game.player.microSlide(Game.player2.tilePosition.x - Game.player.tilePosition.x,
                Game.player2.tilePosition.y - Game.player.tilePosition.y,
                null, () => setTickTimeout(() => Game.player.microSlide(0, 0), 9),
                8);
            Game.player2.microSlide(Game.player.tilePosition.x - Game.player2.tilePosition.x,
                Game.player.tilePosition.y - Game.player2.tilePosition.y,
                null, () => setTickTimeout(() => Game.player2.microSlide(0, 0), 9),
                8);
            kiss();
        }
    }, 6);
}

function mapSetFullView() {
    //for testing purposes ONLY
    Game.TILESIZE = 15;
    redrawTiles(false);
    for (let i = 0; i < Game.darkTiles.length; i++) {
        for (let j = 0; j < Game.darkTiles[0].length; j++) {
            lightTile(j, i);
            Game.darkTiles[i][j].visible = false;
        }
    }
}
