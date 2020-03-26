import {copy2dArray, init2dArray} from "../utils/basic_utils";
import {MAP_SYMBOLS} from "../enums";
import {get8Directions} from "../utils/map_utils";
import {getRandomInt} from "../utils/random_utils";
import PF from "../../../bower_components/pathfinding/pathfinding-browser";

export function mergeRoomIntoLevel(level, room, startX, startY) {
    for (let i = startY; i < startY + room.length; ++i) {
        for (let j = startX; j < startX + room[0].length; ++j) {
            level[i][j] = room[i - startY][j - startX];
        }
    }
}

export function flipHorizontally(room) {
    let newRoom = copy2dArray(room);
    for (let i = 0; i < newRoom.length; ++i) {
        for (let j = 0; j < newRoom[0].length; ++j) {
            newRoom[i][j] = room[i][room[0].length - 1 - j];
        }
    }
    return newRoom;
}

export function flipVertically(room) {
    let newRoom = copy2dArray(room);
    for (let i = 0; i < newRoom.length; ++i) {
        for (let j = 0; j < newRoom[0].length; ++j) {
            newRoom[i][j] = room[room.length - 1 - i][j];
        }
    }
    return newRoom;
}

export function expandLevel(level, expandX, expandY) {
    let expandedLevel = [];
    for (let i = 0; i < level.length + expandY * 2; ++i) {
        expandedLevel[i] = [];
        for (let j = 0; j < level[0].length + expandX * 2; ++j) {
            if (i < expandY || j < expandX || i >= level.length + expandY || j >= level[0].length + expandX) {
                expandedLevel[i][j] = MAP_SYMBOLS.VOID;
            } else {
                expandedLevel[i][j] = level[i - expandY][j - expandX];
            }
        }
    }
    return expandedLevel;
}

export function outlinePathsWithWalls(level) {
    for (let i = 1; i < level.length - 1; ++i) {
        for (let j = 1; j < level[0].length - 1; ++j) {
            if (level[i][j] === MAP_SYMBOLS.PATH || level[i][j] === MAP_SYMBOLS.ENTRY) {
                for (const dir of get8Directions()) {
                    if (level[i + dir.y][j + dir.x] === MAP_SYMBOLS.VOID) {
                        level[i + dir.y][j + dir.x] = MAP_SYMBOLS.WALL
                    }
                }
            }
        }
    }
}

export function outlineWallsWithWalls(level) {
    const placedWalls = init2dArray(level.length, level[0].length, false);
    for (let i = 1; i < level.length - 1; ++i) {
        for (let j = 1; j < level[0].length - 1; ++j) {
            if (level[i][j] === MAP_SYMBOLS.WALL && placedWalls[i][j] === false) {
                for (const dir of get8Directions()) {
                    if (level[i + dir.y][j + dir.x] === MAP_SYMBOLS.VOID) {
                        level[i + dir.y][j + dir.x] = MAP_SYMBOLS.WALL;
                        placedWalls[i + dir.y][j + dir.x] = true;
                    }
                }
            }
        }
    }
}

export function outlineWallsWithSuperWalls(level) {
    for (let i = 1; i < level.length - 1; ++i) {
        for (let j = 1; j < level[0].length - 1; ++j) {
            if (level[i][j] === MAP_SYMBOLS.WALL) {
                for (const dir of get8Directions()) {
                    if (level[i + dir.y][j + dir.x] === MAP_SYMBOLS.VOID) {
                        level[i + dir.y][j + dir.x] = MAP_SYMBOLS.SUPER_WALL
                    }
                }
            }
        }
    }
}

export function connectDiagonalPaths(level) {
    for (let i = 1; i < level.length - 1; ++i) {
        for (let j = 0; j < level[0].length - 1; ++j) {
            if (level[i][j] === MAP_SYMBOLS.PATH) {
                if (level[i - 1][j + 1] === MAP_SYMBOLS.PATH) {
                    let randomWall = getRandomInt(0, 1);
                    if (level[i - 1][j] === MAP_SYMBOLS.WALL && level[i][j + 1] === MAP_SYMBOLS.WALL) {
                        if (randomWall === 0) level[i - 1][j] = MAP_SYMBOLS.PATH;
                        else level[i][j + 1] = MAP_SYMBOLS.PATH;
                    }
                }
                if (level[i + 1][j + 1] === MAP_SYMBOLS.PATH) {
                    let randomWall = getRandomInt(0, 1);
                    if (level[i + 1][j] === MAP_SYMBOLS.WALL && level[i][j + 1] === MAP_SYMBOLS.WALL) {
                        if (randomWall === 0) level[i + 1][j] = MAP_SYMBOLS.PATH;
                        else level[i][j + 1] = MAP_SYMBOLS.PATH;
                    }
                }
            }
        }
    }
}

//entries format = [{x: 1, y:3}, {x:4, y:2} ... ]
export function createRoom(width, height, entries, wallSymbol = MAP_SYMBOLS.WALL) {
    let room = [];
    for (let i = 0; i < height; ++i) {
        room[i] = [];
        for (let j = 0; j < width; ++j) {
            if (j === 0 || j === width - 1 || i === 0 || i === height - 1) {
                room[i][j] = wallSymbol;
            } else room[i][j] = MAP_SYMBOLS.NONE;

            //for tests
            /*if (j === width - 3 && i === height - 3) {
                room[i][j] = MAP_SYMBOLS.PING_PONG_BUDDIES;
            }*/

            for (const entry of entries) {
                if (i === entry.y && j === entry.x) {
                    room[i][j] = MAP_SYMBOLS.ENTRY;
                }
            }
        }
    }
    return room;
}

export function removeGarbage(level) {
    removeRight();
    removeBottom();
    removeTop();
    removeLeft();

    function removeRight() {
        for (let j = level[0].length - 1; j > 0; j--) {
            for (let i = 0; i < level.length; i++) {
                if (level[i][j] !== MAP_SYMBOLS.VOID) return;
            }
            for (let i = 0; i < level.length; i++) {
                level[i].pop();
            }
        }
    }

    function removeBottom() {
        for (let i = level.length - 1; i > 0; i--) {
            for (let j = 0; j < level[0].length; j++) {
                if (level[i][j] !== MAP_SYMBOLS.VOID) return;
            }
            level.pop();
        }
    }

    function removeTop() {
        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[0].length; j++) {
                if (level[i][j] !== MAP_SYMBOLS.VOID) return;
            }
            level.shift();
        }
    }

    function removeLeft() {
        for (let j = 0; j < level[0].length; j++) {
            for (let i = 0; i < level.length; i++) {
                if (level[i][j] !== MAP_SYMBOLS.VOID) return;
            }
            for (let i = 0; i < level.length; i++) {
                level[i].shift();
            }
        }
    }
}

//0 is walkable, 1 is not
export function getLevelPlayerGraph(level) {
    //graph where weights correspond to player's movement ability
    let levelWithPlayerWeights = [];
    for (let i = 0; i < level.length; ++i) {
        levelWithPlayerWeights[i] = [];
        for (let j = 0; j < level[0].length; ++j) {
            if (level[i][j] === MAP_SYMBOLS.VOID || level[i][j] === MAP_SYMBOLS.WALL) {
                levelWithPlayerWeights[i][j] = 1;
            } else {
                levelWithPlayerWeights[i][j] = 0;
            }
        }
    }
    return new PF.Grid(levelWithPlayerWeights);
}