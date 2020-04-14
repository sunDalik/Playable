import {LEVEL_SYMBOLS} from "../enums";
import {get8Directions} from "../utils/map_utils";

export function expandLevel(level, expandX, expandY) {
    let expandedLevel = [];
    for (let i = 0; i < level.length + expandY * 2; ++i) {
        expandedLevel[i] = [];
        for (let j = 0; j < level[0].length + expandX * 2; ++j) {
            if (i < expandY || j < expandX || i >= level.length + expandY || j >= level[0].length + expandX) {
                expandedLevel[i][j] = LEVEL_SYMBOLS.VOID;
            } else {
                expandedLevel[i][j] = level[i - expandY][j - expandX];
            }
        }
    }
    return expandedLevel;
}

export function outlineWallsWithSuperWalls(level) {
    for (let i = 1; i < level.length - 1; ++i) {
        for (let j = 1; j < level[0].length - 1; ++j) {
            if (level[i][j] === LEVEL_SYMBOLS.WALL) {
                for (const dir of get8Directions()) {
                    if (level[i + dir.y][j + dir.x] === LEVEL_SYMBOLS.VOID) {
                        level[i + dir.y][j + dir.x] = LEVEL_SYMBOLS.SUPER_WALL
                    }
                }
            }
        }
    }
}