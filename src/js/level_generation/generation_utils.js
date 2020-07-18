import {LEVEL_SYMBOLS} from "../enums/enums";
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