import {copy2dArray} from "../utils/basic_utils";
import {tutorialLevel} from "./tutorial_level";
import {expandLevel} from "../level_generation/generation_utils";
import {outlineLevelWithWalls, replaceStringsWithObjects} from "../level_generation/standard_generation";
import {Game} from "../game";
import {TriggerTile} from "./trigger_tile";
import {camera} from "../classes/game/camera";
import {lightTile} from "../drawing/lighting";
import {Roller} from "../classes/enemies/fc/roller";
import {TrainingDummy} from "../classes/enemies/training_dummy";
import {TutorialCocoon} from "./tutorial_cocoon";
import {TutorialMushroom} from "./tutorial_mushroom";
import {TutorialSpikyWallTrap} from "./tutorial_spiky_wall_trap";
import {Chest} from "../classes/inanimate_objects/chest";
import {Scythe} from "../classes/equipment/weapons/scythe";
import {LyingItem} from "../classes/equipment/lying_item";
import {Key} from "../classes/equipment/key";
import {TutorialSmallSpider} from "./tutorial_small_spider";
import {TileElement} from "../classes/tile_elements/tile_element";
import {CommonSpriteSheet} from "../loader";
import {STORAGE, TILE_TYPE} from "../enums/enums";
import {drawMovementKeyBindings, getKeyBindSymbol} from "../drawing/draw_hud";
import * as PIXI from "pixi.js";
import {HUDTextStyleTitle} from "../drawing/draw_constants";
import {Z_INDEXES} from "../z_indexing";
import {fadeOutAndDie} from "../animations";

let level = [];
let texts = [];

export function generateTutorialLevel() {
    level = copy2dArray(tutorialLevel);
    level = expandLevel(level, 1, 1);
    outlineLevelWithWalls(level);
    level = expandLevel(level, 1, 1);
    outlineLevelWithWalls(level, true);

    level = replaceStringsWithObjects(level, []);
    setTriggerTiles();
    placeObjects();
    placeEnemies();
    setStartPosition();
    setEndRoomBoundaries();

    texts = [];
    displayText(4, 10, `Use ${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_UP_1P])}${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_LEFT_1P])}${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_DOWN_1P])}${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_RIGHT_1P])} to control white triangle`);
    return level;
}

function placeObjects() {
    level[10][24].entity = new Chest(24, 10, new Scythe());
    const keys = [new LyingItem(23, 11, new Key()),
        new LyingItem(22, 13, new Key()),
        new LyingItem(26, 12, new Key())];
    for (const key of keys) {
        level[key.tilePosition.y][key.tilePosition.x].item = key;
    }

    const exitTile = new TileElement(CommonSpriteSheet["exit_text.png"], 9, 12, true);
    level[exitTile.tilePosition.y][exitTile.tilePosition.x].tile = exitTile;
    level[exitTile.tilePosition.y][exitTile.tilePosition.x].tileType = TILE_TYPE.EXIT;
}

function placeEnemies() {
    const trainingDummy = new TrainingDummy(11, 5);
    level[trainingDummy.tilePosition.y][trainingDummy.tilePosition.x].entity = trainingDummy;
    trainingDummy.scale.x *= -1;

    const trainingDummy2 = new TrainingDummy(18, 5);
    level[trainingDummy2.tilePosition.y][trainingDummy2.tilePosition.x].entity = trainingDummy2;
    trainingDummy2.scale.x *= -1;

    const roller1 = new Roller(22, 2);
    const roller2 = new Roller(28, 3);
    level[roller1.tilePosition.y][roller1.tilePosition.x].entity = roller1;
    level[roller2.tilePosition.y][roller2.tilePosition.x].entity = roller2;
    roller2.direction = -1;
    roller2.scale.x *= -1;

    const cocoon = new TutorialCocoon(38, 5);
    level[cocoon.tilePosition.y][cocoon.tilePosition.x].entity = cocoon;

    const mushroom = new TutorialMushroom(38, 12);
    level[mushroom.tilePosition.y][mushroom.tilePosition.x].entity = mushroom;

    const spikyWallTraps = [new TutorialSpikyWallTrap(33, 13),
        new TutorialSpikyWallTrap(30, 13),
        new TutorialSpikyWallTrap(30, 10)];
    for (const spikyWallTrap of spikyWallTraps) {
        level[spikyWallTrap.tilePosition.y][spikyWallTrap.tilePosition.x].entity = spikyWallTrap;
        level[spikyWallTrap.tilePosition.y][spikyWallTrap.tilePosition.x].tile = null;
    }

    const smallSpiders = [new TutorialSmallSpider(16, 10),
        new TutorialSmallSpider(16, 11),
        new TutorialSmallSpider(16, 12),
        new TutorialSmallSpider(16, 13),
        new TutorialSmallSpider(15, 10),
        new TutorialSmallSpider(15, 11),
        new TutorialSmallSpider(15, 12),
        new TutorialSmallSpider(15, 13)];
    for (const smallSpider of smallSpiders) {
        level[smallSpider.tilePosition.y][smallSpider.tilePosition.x].entity = smallSpider;
        smallSpider.companionSpiders = smallSpiders;
    }
}

function setStartPosition() {
    Game.startPos = {
        x: 4,
        y: 11
    };
}

function setEndRoomBoundaries() {
    Game.endRoomBoundaries = [{x: -3, y: -2}, {x: -2, y: -3}];
}

function setTriggerTiles() {
    for (let x = 0; x < level[0].length; x++) {
        for (let y = 0; y < level.length; y++) {
            level[y][x].triggerTile = null;
        }
    }

    const blackPlayerRespawnTriggerTile = new TriggerTile();
    blackPlayerRespawnTriggerTile.onTrigger = () => {
        clearTexts();
        displayText(4, 4, `Use ${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_UP_2P])}${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_LEFT_2P])}${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_DOWN_2P])}${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_RIGHT_2P])} to control black triangle`);
        if (Game.player2.dead) {
            Game.player2.dead = false;
            Game.player2.visible = true;
            Game.world.addChild(Game.player2);
            Game.player2.health = 1;
            Game.player2.setTilePosition(4, 5);
            camera.moveToCenter(10);
            drawMovementKeyBindings();

            Game.player.respawnPoint = {x: 3, y: 5};
            Game.player2.respawnPoint = {x: 5, y: 5};
        }
    };

    const trainingDummyTriggerTile = new TriggerTile();
    trainingDummyTriggerTile.onTrigger = () => {
        clearTexts();
        displayText(11, 3, "Attack enemies by moving onto them");
        displayText(11, 7, "White has x0.5 atk multiplier\nBlack has x0.5 def multiplier");
        displayText(11, 9.5, "They are weak alone, but together they are unstoppable", true, Game.TILESIZE * 5);
    };

    const trainingDummyTriggerTile2 = new TriggerTile();
    trainingDummyTriggerTile2.onTrigger = () => {
        clearTexts();
        displayText(18, 3, `When triangles stand together, only the top one takes damage from enemies and is able to attack`, true, Game.TILESIZE * 5);
        displayText(18, 8.5, `Press ${getKeyBindSymbol(window.localStorage[STORAGE.KEY_Z_SWITCH])} to switch position`, true);
    };

    const rollersInsideWallsLightTriggerTiles = new TriggerTile();
    rollersInsideWallsLightTriggerTiles.onTrigger = () => {
        for (let x = 21; x <= 29; x++) {
            for (let y = 1; y <= 4; y++) {
                if (!Game.map[y][x].lit) lightTile(x, y);
            }
        }
        clearTexts();
        displayText(24, 6, "This is a turn-based game and enemies move only after you", false, Game.TILESIZE * 5);
        displayText(24, 9.5, "If you move triangles simultaneously, they will both move in one turn", true, Game.TILESIZE * 6);
    };

    const spiderTriggerTile = new TriggerTile();
    spiderTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 30, y: 5};
        Game.player2.respawnPoint = {x: 31, y: 5};
        clearTexts();
        displayText(32.5, 3.5, "Don't rush! Let spider come close to you by skipping turns", true, Game.TILESIZE * 6);
        displayText(32.5, 7.5, "One way to skip turns is to bump into walls", true, Game.TILESIZE * 6);
    };

    const mushroomTriggerTile = new TriggerTile();
    mushroomTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 38, y: 9};
        Game.player2.respawnPoint = {x: 38, y: 8};
        clearTexts();
        displayText(43, 11, "Poison hazards damage you!\nUse spear to kill mushroom without getting close", true);
    };

    const spikyWallTrapTriggerTile = new TriggerTile();
    spikyWallTrapTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 35, y: 12};
        Game.player2.respawnPoint = {x: 35, y: 12};
        clearTexts();
        displayText(33, 9.5, "Spiky wall traps try to predict your movement", true);
        displayText(32, 14.5, "Skipping a turn is a powerful move", true);
    };

    const smallSpidersTriggerTile = new TriggerTile();
    smallSpidersTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 22, y: 11};
        Game.player2.respawnPoint = {x: 21, y: 11};
        clearTexts();
        displayText(19, 11, "Don't forget to equip your weapon into 'Weapon' slot", false, Game.TILESIZE * 3);
    };

    const exitTriggerTile = new TriggerTile();
    exitTriggerTile.onTrigger = () => {
        clearTexts();
        displayText(9, 12, "Good luck <3");
    };

    level[8][4].triggerTile = blackPlayerRespawnTriggerTile;
    level[5][7].triggerTile = trainingDummyTriggerTile;
    level[6][15].triggerTile = trainingDummyTriggerTile2;
    level[6][21].triggerTile = rollersInsideWallsLightTriggerTiles;
    level[5][29].triggerTile = spiderTriggerTile;
    level[7][38].triggerTile = mushroomTriggerTile;
    level[12][36].triggerTile = spikyWallTrapTriggerTile;
    level[11][21].triggerTile = smallSpidersTriggerTile;
    level[12][13].triggerTile = exitTriggerTile;
}

// x is the central tile position, y is the lowest tile position
function displayText(x, y, text, highZIndex = false, width = Game.TILESIZE * 4) {
    const textObject = new PIXI.Text(text, HUDTextStyleTitle);
    textObject.style.wordWrap = true;
    textObject.style.wordWrapWidth = width;
    textObject.position.x = (x * Game.TILESIZE + Game.TILESIZE / 2) - textObject.width / 2;
    textObject.position.y = y * Game.TILESIZE - Game.TILESIZE / 2 - textObject.height / 2;
    if (highZIndex) textObject.zIndex = 16 * 10 + Z_INDEXES.DARKNESS;
    else textObject.zIndex = Z_INDEXES.HAZARD + 1;
    Game.world.addChild(textObject);
    texts.push(textObject);
}

function clearTexts() {
    for (const text of texts) {
        fadeOutAndDie(text);
    }
    texts = [];
}