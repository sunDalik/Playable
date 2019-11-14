import * as PIXI from "pixi.js"
import {Game} from "./game"
import {loadAll} from "./loader"
import {Player} from "./classes/player"
import {Knife} from "./classes/equipment/weapons/knife"
import {BasicArmor} from "./classes/equipment/armor/basic_armor"
import * as draw from "./draw"
import * as camera from "./camera"
import {STAGE} from "./enums"
import {generateLevel, getLevelPlayerGraph} from "./level_generation"
import {keyboard} from "./keyboard_handler"
import {playerTurn, switchPlayers} from "./game_logic"
import {calculateDetectionGraph, generateMap} from "./map_generation"
import {lightPlayerPosition} from "./lighting";
import {initPools, setVariablesForStage} from "./game_changer";
import {Aura} from "./classes/magic/aura";


PIXI.utils.skipHello();
const app = initApplication();
Game.APP = app;
Game.loader = app.loader;
Game.resources = app.loader.resources;
loadAll(setup);

function initApplication() {
    let app = new PIXI.Application({resolution: window.devicePixelRatio});
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resolution = 2;
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

    Game.HUD = new PIXI.Container();
    Game.hearts1 = new PIXI.Container();
    Game.hearts2 = new PIXI.Container();
    Game.slots1 = new PIXI.Container();
    Game.slots2 = new PIXI.Container();
    Game.HUD.addChild(Game.hearts1);
    Game.HUD.addChild(Game.hearts2);
    Game.HUD.addChild(Game.slots1);
    Game.HUD.addChild(Game.slots2);
    Game.APP.stage.addChild(Game.HUD);

    Game.world.sortableChildren = true;
    Game.APP.stage.sortableChildren = true;
    Game.slots1.sortableChildren = true;
    Game.slots2.sortableChildren = true;

    Game.player = new Player(Game.resources["src/images/player.png"].texture, 0, 0);
    Game.player2 = new Player(Game.resources["src/images/player2.png"].texture, 0, 0);
    Game.player.setStats(0, 0.5, 0, 1.00);
    Game.player2.setStats(0, 1.00, 0, 0.5);
    Game.player2.weapon = new Knife();
    Game.player.armor = new BasicArmor();

    draw.drawHUD();
    bindKeys();
    window.addEventListener("resize", () => {
        draw.drawHUD();
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

    Game.player.tilePosition.set(Game.startX, Game.startY);
    Game.player2.tilePosition.set(Game.startX + 1, Game.startY + 1);
    Game.player.place();
    Game.player2.place();
    Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].entity = Game.player;
    Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].entity = Game.player2;

    Game.grid = draw.drawGrid();
    draw.drawTiles();
    draw.drawEntities();
    draw.drawHUD();
    draw.drawOther();
    draw.createDarkness();
    lightPlayerPosition(Game.player);
    lightPlayerPosition(Game.player2);
    camera.centerCamera();
}

function bindKeys() {
    bindMovement(Game.player, {upCode: "KeyW", leftCode: "KeyA", downCode: "KeyS", rightCode: "KeyD"});
    /*bindMovement(Game.player2, {
        upCode: "ArrowUp",
        leftCode: "ArrowLeft",
        downCode: "ArrowDown",
        rightCode: "ArrowRight"
    }); */
    //experimental
    bindMovement(Game.player2, {upCode: "KeyI", leftCode: "KeyJ", downCode: "KeyK", rightCode: "KeyL"});
    bindMagic(Game.player, {oneCode: "Digit1", twoCode: "Digit2", threeCode: "Digit3", fourCode: "Digit4"});
    bindMagic(Game.player2, {oneCode: "Digit7", twoCode: "Digit8", threeCode: "Digit9", fourCode: "Digit0"});

    const switchKey = keyboard("KeyZ");
    switchKey.press = () => {
        playerTurn(null, switchPlayers, true)
    };

    const shieldKeyP1 = keyboard("KeyE");
    shieldKeyP1.press = () => {
        playerTurn(Game.player, () => Game.player.activateShield())
    };

    const shieldKeyP2 = keyboard("KeyO");
    shieldKeyP2.press = () => {
        playerTurn(Game.player2, () => Game.player2.activateShield())
    };
}

function bindMovement(player, {upCode, leftCode, downCode, rightCode}) {
    const upKey = keyboard(upCode);
    const leftKey = keyboard(leftCode);
    const downKey = keyboard(downCode);
    const rightKey = keyboard(rightCode);
    upKey.press = (e) => {
        playerTurn(player, () => player.move(0, -1, e));
    };
    leftKey.press = (e) => {
        playerTurn(player, () => player.move(-1, 0, e));
    };
    downKey.press = (e) => {
        playerTurn(player, () => player.move(0, 1, e));

    };
    rightKey.press = (e) => {
        playerTurn(player, () => player.move(1, 0, e));
    };
    return {upKey: upKey, leftKey: leftKey, downKey: downKey, rightKey: rightKey}
}

function bindMagic(player, {oneCode, twoCode, threeCode, fourCode}) {
    const oneKey = keyboard(oneCode);
    const twoKey = keyboard(twoCode);
    const threeKey = keyboard(threeCode);
    const fourKey = keyboard(fourCode);
    oneKey.press = () => {
        if (player.magic1) playerTurn(player, () => player.castMagic(player.magic1));
    };
    twoKey.press = () => {
        if (player.magic2) playerTurn(player, () => player.castMagic(player.magic2));
    };
    threeKey.press = () => {
        if (player.magic3) playerTurn(player, () => player.castMagic(player.magic3));
    };
    fourKey.press = () => {
        if (player.magic4) playerTurn(player, () => player.castMagic(player.magic4));
    };

    return {oneKey: oneKey, twoKey: twoKey, threeKey: threeKey, fourKey: fourKey}
}