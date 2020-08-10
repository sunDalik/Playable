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

let level = [];

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
        if (!blackPlayerRespawnTriggerTile.triggered) {
            displayText(4, 4, `Use ${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_UP_2P])}${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_LEFT_2P])}${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_DOWN_2P])}${getKeyBindSymbol(window.localStorage[STORAGE.KEY_MOVE_RIGHT_2P])} to control black triangle`);
        }
        blackPlayerRespawnTriggerTile.triggered = true;
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
        if (!trainingDummyTriggerTile.triggered) {
            displayText(11, 4, "Attack enemies by moving onto them");
        }
        trainingDummyTriggerTile.triggered = true;
    };

    const trainingDummyTriggerTile2 = new TriggerTile();
    trainingDummyTriggerTile2.onTrigger = () => {
        if (!trainingDummyTriggerTile2.triggered) {
            displayText(11, 4, "Attack enemies by moving onto them");
        }
        trainingDummyTriggerTile2.triggered = true;
    };

    const rollersInsideWallsLightTriggerTiles = new TriggerTile();
    rollersInsideWallsLightTriggerTiles.onTrigger = () => {
        if (!rollersInsideWallsLightTriggerTiles.triggered) {

            for (let x = 21; x <= 29; x++) {
                for (let y = 1; y <= 4; y++) {
                    if (!Game.map[y][x].lit) lightTile(x, y);
                }
            }
        }
        rollersInsideWallsLightTriggerTiles.triggered = true;
    };

    const spiderTriggerTile = new TriggerTile();
    spiderTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 30, y: 5};
        Game.player2.respawnPoint = {x: 31, y: 5};

        if (!spiderTriggerTile.triggered) {
            displayText(11, 4, "Attack enemies by moving onto them");
        }
        spiderTriggerTile.triggered = true;
    };

    const mushroomTriggerTile = new TriggerTile();
    mushroomTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 38, y: 9};
        Game.player2.respawnPoint = {x: 38, y: 8};

        if (!mushroomTriggerTile.triggered) {
            displayText(11, 4, "Attack enemies by moving onto them");
        }
        mushroomTriggerTile.triggered = true;
    };

    const spikyWallTrapTriggerTile = new TriggerTile();
    spikyWallTrapTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 35, y: 12};
        Game.player2.respawnPoint = {x: 35, y: 12};

        if (!spikyWallTrapTriggerTile.triggered) {
            displayText(11, 4, "Attack enemies by moving onto them");
        }
        spikyWallTrapTriggerTile.triggered = true;
    };

    const smallSpidersTriggerTile = new TriggerTile();
    smallSpidersTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 22, y: 11};
        Game.player2.respawnPoint = {x: 21, y: 11};

        if (!smallSpidersTriggerTile.triggered) {
            displayText(11, 4, "Attack enemies by moving onto them");
        }
        smallSpidersTriggerTile.triggered = true;
    };

    level[8][4].triggerTile = blackPlayerRespawnTriggerTile;
    level[5][7].triggerTile = trainingDummyTriggerTile;
    level[6][15].triggerTile = trainingDummyTriggerTile2;
    level[6][21].triggerTile = rollersInsideWallsLightTriggerTiles;
    level[5][29].triggerTile = spiderTriggerTile;
    level[7][38].triggerTile = mushroomTriggerTile;
    level[12][36].triggerTile = spikyWallTrapTriggerTile;
    level[11][21].triggerTile = smallSpidersTriggerTile;
}

function displayText(x, y, text) {
    const textObject = new PIXI.Text(text, HUDTextStyleTitle);
    textObject.style.wordWrap = true;
    textObject.style.wordWrapWidth = Game.TILESIZE * 4;
    textObject.position.x = (x * Game.TILESIZE + Game.TILESIZE / 2) - textObject.width / 2;
    textObject.position.y = y * Game.TILESIZE - Game.TILESIZE / 2 - textObject.height / 2;
    textObject.zIndex = Z_INDEXES.HAZARD + 1;
    Game.world.addChild(textObject);
    console.log("dww");
}