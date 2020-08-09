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
import {SpiderSmall} from "../classes/enemies/fc/spider_small";
import {TutorialSmallSpider} from "./tutorial_small_spider";

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
}

function placeEnemies() {
    const trainingDummy = new TrainingDummy(17, 5);
    level[trainingDummy.tilePosition.y][trainingDummy.tilePosition.x].entity = trainingDummy;
    trainingDummy.scale.x *= -1;

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
        y: 5
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
        if (Game.player2.dead) {
            Game.player2.dead = false;
            Game.player2.visible = true;
            Game.world.addChild(Game.player2);
            Game.player2.health = 1;
            Game.player2.setTilePosition(10, 5);
            camera.moveToCenter(10);

            Game.player.respawnPoint = {x: 9, y: 5};
            Game.player2.respawnPoint = {x: 11, y: 5};
        }
    };

    const rollersInsideWallsLightTriggerTiles = new TriggerTile();
    rollersInsideWallsLightTriggerTiles.onTrigger = () => {
        for (let x = 21; x <= 29; x++) {
            for (let y = 1; y <= 4; y++) {
                if (!Game.map[y][x].lit) lightTile(x, y);
            }
        }
    };

    const trainingDummyTriggerTile = new TriggerTile();
    trainingDummyTriggerTile.onTrigger = () => {
    };

    const spiderTriggerTile = new TriggerTile();
    spiderTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 30, y: 5};
        Game.player2.respawnPoint = {x: 31, y: 5};
    };

    const mushroomTriggerTile = new TriggerTile();
    mushroomTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 38, y: 9};
        Game.player2.respawnPoint = {x: 38, y: 8};
    };

    const spikyWallTrapTriggerTile = new TriggerTile();
    spikyWallTrapTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 35, y: 12};
        Game.player2.respawnPoint = {x: 35, y: 12};
    };

    const smallSpidersTriggerTile = new TriggerTile();
    smallSpidersTriggerTile.onTrigger = () => {
        Game.player.respawnPoint = {x: 22, y: 11};
        Game.player2.respawnPoint = {x: 21, y: 11};
    };

    level[5][7].triggerTile = blackPlayerRespawnTriggerTile;
    level[5][13].triggerTile = trainingDummyTriggerTile;
    level[6][21].triggerTile = rollersInsideWallsLightTriggerTiles;
    level[5][29].triggerTile = spiderTriggerTile;
    level[7][38].triggerTile = mushroomTriggerTile;
    level[12][36].triggerTile = spikyWallTrapTriggerTile;
    level[11][21].triggerTile = smallSpidersTriggerTile;
}