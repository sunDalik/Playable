import {LEVEL_SYMBOLS} from "../enums/enums";

// short aliases
const w = LEVEL_SYMBOLS.WALL;
const s = LEVEL_SYMBOLS.SUPER_WALL;
const n = LEVEL_SYMBOLS.NONE;
const e = LEVEL_SYMBOLS.ENTRY;


export const tutorialLevel = [
    [w, w, w, w, w, w, w, w, w, w, w, w, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, w, w, w, w, w, w, w, w, w, w, w],
    [n, n, n, n, n, w, n, n, n, n, n, w, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, w, w, w, w, w, w, w, w, w, w, w],
    [n, n, n, n, n, w, n, n, n, n, n, w, n, n, n, n, n, n, n, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, n, n, n],
    [n, n, n, n, n, e, n, n, n, n, n, e, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, e, n, n, n, n, n, n, n, n, n, n],
    [n, n, n, n, n, w, n, n, n, n, n, w, n, n, n, n, n, n, n, e, n, n, n, n, n, n, n, w, w, w, w, w, w, w, w, n, n, n],
    [n, n, n, n, n, w, n, n, n, n, n, w, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, w, n, n, n, n, n, n, w, w, e, w],
    [w, w, w, w, w, w, w, w, w, w, w, w, n, n, n, n, n, n, n, w, w, w, w, w, w, w, w, w, n, n, n, n, n, n, n, w, n, w],
    [n, n, n, n, n, n, n, n, n, n, n, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, w, n, n, n, n, n, n, w, w, n, w],
    [n, n, n, n, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, w, n, n, n, n, n, w, w, w, w, w, w, w, w, w, w, n, n, n],
    [n, n, n, n, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, e, n, n, n, n, n, e, n, n, n, n, n, n, n, n, w, n, n, n],
    [n, n, n, n, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, w, n, n, n, n, n, w, n, n, n, n, n, n, n, n, e, n, n, n],
    [n, n, n, n, n, n, n, n, n, n, n, w, n, n, n, n, n, n, n, w, n, n, w, w, w, w, w, w, w, w, w, w, w, w, w, n, n, n]
];