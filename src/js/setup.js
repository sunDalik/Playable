import * as PIXI from "pixi.js";
import {Game} from "./game";
import {camera} from "./classes/game/camera";
import {loadAll} from "./loader";
import {Player} from "./classes/player";
import {Knife} from "./classes/equipment/weapons/knife";
import {BasicArmor} from "./classes/equipment/armor/basic";
import {STAGE} from "./enums";
import {generateLevel} from "./level_generation/level_generation";
import {calculateDetectionGraph, generateMap} from "./map_generation";
import {lightPlayerPosition, lightPosition, lightTile} from "./drawing/lighting";
import {initPools, setVariablesForStage} from "./game_changer";
import {createDarkness, drawEntities, drawGrid, drawOther, drawTiles} from "./drawing/draw_init";
import {drawHUD, drawInteractionKeys, drawMiniMap, drawMovementKeyBindings} from "./drawing/draw_hud";
import {bindKeys} from "./keyboard/keyboard_binds";
import {HUD} from "./drawing/hud_object";
import {randomChoice} from "./utils/random_utils";
import {get8DirectionsWithoutItems, getCardinalDirectionsWithoutItems} from "./utils/map_utils";
import {kiss, swapEquipmentWithPlayer} from "./game_logic";
import {World} from "./classes/game/world";
import {setTickTimeout} from "./utils/game_utils";
import {retreatBlackBars} from "./drawing/hud_animations";
import {getLevelPlayerGraph} from "./level_generation/generation_utils";
import {Torch} from "./classes/equipment/tools/torch";

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
    Game.world.sortableChildren = true;
    Game.app.stage.sortableChildren = true;

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
    for (const enemy of Game.enemies) {
        if (enemy.afterMapGen) enemy.afterMapGen();
    }
    drawOther();
    drawMiniMap();
    createDarkness();
    if (!Game.player.dead) lightPlayerPosition(Game.player);
    if (!Game.player2.dead) lightPlayerPosition(Game.player2);
    if (Game.stage === STAGE.DARK_TUNNEL) {
        lightPosition(Game.torchTile, Game.map[Game.torchTile.y][Game.torchTile.x].item.item.lightSpread, true);
    }
    camera.center();

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
}

function test() {
    for (let i = 0; i < Game.map.length; i++) {
        for (let j = 0; j < Game.map[0].length; j++) {
            lightTile(j, i);
        }
    }
    if (Game.stage === STAGE.DARK_TUNNEL) swapEquipmentWithPlayer(Game.player, new Torch(), false);
    //camera.setup(Game.world.width / 2, Game.world.height / 2);
}