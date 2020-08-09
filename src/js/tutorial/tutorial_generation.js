import {copy2dArray} from "../utils/basic_utils";
import {tutorialLevel} from "./tutorial_level";
import {expandLevel} from "../level_generation/generation_utils";
import {outlineLevelWithWalls, replaceStringsWithObjects} from "../level_generation/standard_generation";
import {Game} from "../game";

let level = [];

export function generateTutorialLevel() {
    level = copy2dArray(tutorialLevel);
    level = expandLevel(level, 1, 1);
    outlineLevelWithWalls(level);
    level = expandLevel(level, 1, 1);
    outlineLevelWithWalls(level, true);

    level = replaceStringsWithObjects(level, []);
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
        x: 5,
        y: 5
    };
}

function setEndRoomBoundaries() {
    Game.endRoomBoundaries = [{x: -3, y: -2},{x: -2, y: -3}];
}