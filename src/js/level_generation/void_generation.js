import {init2dArray} from "../utils/basic_utils";
import {outlineLevelWithWalls, replaceStringsWithObjects} from "../level_generation/standard_generation";
import {Game} from "../game";
import {Imp} from "../classes/enemies/bosses/imp";
import {expandLevel} from "./generation_utils";

let level = [];

export function generateVoid() {
    level = init2dArray(11, 11, "");
    outlineLevelWithWalls(level, true);
    level = expandLevel(level, 1, 1);
    outlineLevelWithWalls(level, true);

    level = replaceStringsWithObjects(level, []);

    placeBoss();
    setStartPosition();
    setEndRoomBoundaries();
    return level;
}

function placeBoss() {
    level[3][6].entity = new Imp(6, 3);
}

function setStartPosition() {
    Game.startPos = {
        x: 6,
        y: 8
    };
}

function setEndRoomBoundaries() {
    Game.endRoomBoundaries = [{x: 1, y: 1}, {x: level.length - 2, y: level[0].length - 2}];
}