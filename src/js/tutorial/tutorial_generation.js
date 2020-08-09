import {copy2dArray} from "../utils/basic_utils";
import {tutorialLevel} from "./tutorial_level";
import {expandLevel} from "../level_generation/generation_utils";
import {outlineLevelWithWalls, replaceStringsWithObjects} from "../level_generation/standard_generation";
import {Game} from "../game";
import {TriggerTile} from "./triggerTile";
import {camera} from "../classes/game/camera";

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

}

function placeEnemies() {

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
        Game.player2.dead = false;
        Game.player2.visible = true;
        Game.world.addChild(Game.player2);
        Game.player2.health = 1;
        Game.player2.setTilePosition(10, 5);
        camera.moveToCenter(10);
    };

    level[5][7].triggerTile = blackPlayerRespawnTriggerTile;
}