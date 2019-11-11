"use strict";
import * as PIXI from "pixi.js"
import {Game} from "./game"
import {loadAll} from "./loader"
import {Player} from "./classes/player"
import {Knife} from "./classes/equipment/weapons/knife"
import {BasicArmor} from "./classes/equipment/armor/basic_armor"
import * as draw from "./draw"
import * as camera from "./camera"
import {STAGE} from "./enums"
import {Aura} from "./classes/magic/aura"
import {Spikes} from "./classes/magic/spikes"
import {Necromancy} from "./classes/magic/necromancy"
import {Fireball} from "./classes/magic/fireball"
import {Petrification} from "./classes/magic/petrification"
import {Teleport} from "./classes/magic/teleport"
import {Pickaxe} from "./classes/equipment/tools/pickaxe"
import {WizardRobe} from "./classes/equipment/armor/wizard_robe"
import {DamagingBoots} from "./classes/equipment/footwear/damaging"
import {AntiHazardBoots} from "./classes/equipment/footwear/anti_hazard"
import {SeerCirclet} from "./classes/equipment/headwear/seer_circlet"
import {WizardHat} from "./classes/equipment/headwear/wizard_hat"
import {generateLevel, getLevelPlayerGraph} from "./level_generation"
import {keyboard} from "./keyboard_handler"
import {playerTurn, switchPlayers} from "./game_logic"
import * as rooms from "./rooms"
import {generateMap, calculateDetectionGraph} from "./map_generation"


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
    Game.magicPool = [new Aura(), new Spikes(), new Fireball(), new Necromancy(), new Petrification(), new Teleport()];
    Game.chestItemPool = [new Pickaxe(), new BasicArmor(), new WizardRobe(), new SeerCirclet(), new WizardHat(),
        new AntiHazardBoots(), new DamagingBoots()];
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
    draw.lightPlayerPosition(Game.player);
    draw.lightPlayerPosition(Game.player2);
    camera.centerCamera();
}

function bindKeys() {
    bindMovement(Game.player, {upCode: 87, leftCode: 65, downCode: 83, rightCode: 68}); //w a s d
    bindMovement(Game.player2, {upCode: 38, leftCode: 37, downCode: 40, rightCode: 39}); //arrows
    bindMagic(Game.player, {oneCode: 49, twoCode: 50, threeCode: 51, fourCode: 52}); //1 2 3 4
    bindMagic(Game.player2, {oneCode: 55, twoCode: 56, threeCode: 57, fourCode: 48}); //7 8 9 0

    const switchKey = keyboard(90); //Z
    switchKey.press = () => {
        playerTurn(null, switchPlayers, true)
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

export function incrementStage() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            Game.stage = STAGE.DARK_TUNNEL;
            break;
        case STAGE.DARK_TUNNEL:
            Game.stage = STAGE.RUINS;
            break;
        case STAGE.RUINS:
            Game.stage = STAGE.DUNNO;
            break;
        case STAGE.DUNNO:
            Game.stage = STAGE.FINALE;
            break;
    }
}

export function setVariablesForStage() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            Game.normalRooms = rooms.FCNormalRooms;
            Game.statueRooms = rooms.FCStatueRooms;
            Game.obeliskRooms = rooms.FCObeliskRooms;
            Game.chestRooms = rooms.FCChestRooms;
            Game.BGColor = "0xabcfd1";
            break;
        case STAGE.DARK_TUNNEL:
            Game.normalRooms = rooms.DTNormalRooms;
            Game.statueRooms = rooms.DTStatueRooms;
            Game.obeliskRooms = rooms.DTObeliskRooms;
            Game.chestRooms = rooms.DTChestRooms;
            Game.BGColor = "0x666666";
            break;
        case STAGE.RUINS:
            Game.BGColor = "0xd8d9d7";
            break;
        case STAGE.DUNNO:
            Game.BGColor = "0x75c978";
            break;
        case STAGE.FINALE:
            Game.BGColor = "0xcc76cc";
            break;
    }
}