import {getRandomInt, randomChoice} from "../utils/random_utils";
import {init2dArray, removeObjectFromArray} from "../utils/basic_utils";
import {LEVEL_SYMBOLS, PLANE, TILE_TYPE} from "../enums";
import {Game} from "../game";
import {expandLevel, outlineWallsWithSuperWalls} from "./generation_utils";
import {comboShapers, shapers, startingRoomShaper} from "./room_shapers";
import {WallTile} from "../classes/draw/wall";
import {SuperWallTile} from "../classes/draw/super_wall";
import {TileElement} from "../classes/tile_elements/tile_element";
import {CommonSpriteSheet} from "../loader";

const minRoomSize = 7;
const minRoomArea = 54;
let roomId = 0;
let level;

//todo add local class Room
//maybe rooms should be visible for the whole file like level?
export function generateExperimental() {
    level = initEmptyLevel();
    const rooms = splitRoomAMAP({offsetX: 0, offsetY: 0, width: level[0].length, height: level.length, id: roomId++});
    for (const room of rooms) {
        outlineRoomWithWalls(room);
        if (Math.random() > 0.5) shapeRoom(room, randomChoice(comboShapers));
        else shapeRoom(room, randomChoice(shapers));
        //shapeRoom(room, shapers[2]); //for testing
        randomlyRotateRoom(room)
    }
    replaceNumbers();
    const bossRoom = findBossRoom(rooms);
    clearShape(bossRoom);
    const path = planPath(bossRoom, rooms);
    const startRoom = path[path.length - 1];
    reshapeRoom(startRoom, startingRoomShaper);
    drawPath(path);
    const unconnectedRooms = rooms.filter(room => !path.includes(room));
    let attempt = 0;
    while (unconnectedRooms.length > 1) {
        const room = randomChoice(unconnectedRooms);
        const nextRoom = randomChoice(getAdjacentRooms(room, rooms).filter(r => !unconnectedRooms.includes(r) && r !== bossRoom));
        if (nextRoom === undefined) {
            if (attempt++ > 200) break;
        } else {
            drawPath([room, nextRoom]);
            removeObjectFromArray(room, unconnectedRooms);
        }
    }
    const secretRoom = unconnectedRooms[0];
    reshapeRoom(secretRoom, shapers[1]);
    level = expandLevelAndRooms(level, rooms, 1, 1);
    outlineWallsWithSuperWalls(level);

    //level shaping is finished
    level = replaceStringsWithObjects();

    setStartPosition(startRoom);
    setBossRoomPosition(bossRoom);
    return level;
}

function initEmptyLevel() {
    const minLevelSize = 30;
    const maxLevelSize = 40;
    const width = getRandomInt(minLevelSize, maxLevelSize);
    const height = getRandomInt(minLevelSize, maxLevelSize);
    roomId = 0;
    return init2dArray(height, width, -1);
}

function splitRoomAMAP(initialRoom) {
    const rooms = [initialRoom];
    let i = 0;
    while (i < rooms.length) {
        const room = rooms[i];
        if (canBeDivided(room.width, room.height)) {
            const newRooms = divideRoom(room.offsetX, room.offsetY, room.width, room.height);
            if (newRooms !== null) rooms.splice(i, 1, ...newRooms);
            else i++;
        } else i++;
    }
    return rooms;
}

function divideRoom(offsetX, offsetY, width, height) {
    let attempt = 0;
    //const dividingPlane = width > height ? PLANE.VERTICAL : PLANE.HORIZONTAL;
    while (attempt++ < 500) {
        const dividingPlane = randomChoice([PLANE.VERTICAL, PLANE.HORIZONTAL]);
        //dividing line tiles will be included in the leftmost/topmost room;
        const dividerX = dividingPlane === PLANE.VERTICAL ? getRandomInt(minRoomSize - 1, width - minRoomSize - 1) : -1;
        const dividerY = dividingPlane === PLANE.HORIZONTAL ? getRandomInt(minRoomSize - 1, height - minRoomSize - 1) : -1;
        let rooms = [];
        if (dividingPlane === PLANE.HORIZONTAL) {
            rooms[0] = {offsetX: offsetX, offsetY: offsetY, width: width, height: dividerY + 1};
            rooms[1] = {
                offsetX: offsetX,
                offsetY: offsetY + rooms[0].height,
                width: width,
                height: height - rooms[0].height
            };
        } else {
            rooms[0] = {offsetX: offsetX, offsetY: offsetY, width: dividerX + 1, height: height};
            rooms[1] = {
                offsetX: offsetX + rooms[0].width,
                offsetY: offsetY,
                width: width - rooms[0].width,
                height: height
            };
        }

        if (isRoomGood(rooms[0].width, rooms[0].height) && isRoomGood(rooms[1].width, rooms[1].height)) {
            for (let i = 0; i < 2; i++) {
                rooms[i].id = roomId++;
                assignRoom(rooms[i].offsetX, rooms[i].offsetY, rooms[i].width, rooms[i].height, rooms[i].id);
            }
            return rooms;
        }
    }
    return null;
}

function assignRoom(offsetX, offsetY, width, height, id = roomId) {
    for (let i = offsetY; i < offsetY + height; i++) {
        for (let j = offsetX; j < offsetX + width; j++) {
            level[i][j] = id;
        }
    }
}

function canBeDivided(width, height) {
    return isRoomGood(Math.floor(width / 2), height) || isRoomGood(width, Math.floor(height / 2));
}

function isRoomGood(width, height) {
    const minDimension = Math.min(width, height);
    const area = width * height;
    return minDimension >= minRoomSize && area >= minRoomArea;
}

function outlineRoomWithWalls(room) {
    for (let i = 0; i < room.height; i++) {
        for (let j = 0; j < room.width; j++) {
            if (i === 0 || j === 0 || i === room.height - 1 || j === room.width - 1) {
                level[i + room.offsetY][j + room.offsetX] = LEVEL_SYMBOLS.WALL;
            }
        }
    }
}

function shapeRoom(room, shaper) {
    for (let i = 1; i < room.height - 1; i++) {
        for (let j = 1; j < room.width - 1; j++) {
            if (shaper(j, i, room.width, room.height)) {
                level[i + room.offsetY][j + room.offsetX] = LEVEL_SYMBOLS.WALL;
            }
        }
    }
}

function clearShape(room) {
    for (let i = 1; i < room.height - 1; i++) {
        for (let j = 1; j < room.width - 1; j++) {
            level[i + room.offsetY][j + room.offsetX] = LEVEL_SYMBOLS.NONE;
        }
    }
}

function reshapeRoom(room, shaper) {
    clearShape(room);
    shapeRoom(room, shaper);
}

function randomlyRotateRoom(room) {
    const transformOption = getRandomInt(0, 3);
    switch (transformOption) {
        case 1:
            mirrorRoomHorizontally(room);
            break;
        case 2:
            mirrorRoomVertically(room);
            break;
        case 3:
            mirrorRoomVertically(room);
            mirrorRoomHorizontally(room);
            break;
    }
}

function mirrorRoomVertically(room) {
    const oldRoom = copyPartOf2dArray(level, room.offsetX, room.offsetY, room.width, room.height);
    for (let i = 0; i < room.height; i++) {
        for (let j = 0; j < room.width; j++) {
            level[i + room.offsetY][j + room.offsetX] = oldRoom[room.height - 1 - i][j];
        }
    }
}

function mirrorRoomHorizontally(room) {
    const oldRoom = copyPartOf2dArray(level, room.offsetX, room.offsetY, room.width, room.height);
    for (let i = 0; i < room.height; i++) {
        for (let j = 0; j < room.width; j++) {
            level[i + room.offsetY][j + room.offsetX] = oldRoom[i][room.width - 1 - j];
        }
    }
}

function replaceNumbers() {
    for (let i = 0; i < level.length; i++) {
        for (let j = 0; j < level[0].length; j++) {
            if (level[i][j] === -1)
                level[i][j] = LEVEL_SYMBOLS.VOID;
            else if (typeof level[i][j] === "number")
                level[i][j] = LEVEL_SYMBOLS.NONE;
        }
    }
}

function copyPartOf2dArray(array, offsetX, offsetY, width, height) {
    const newArray = [];
    for (let i = 0; i < height; i++) {
        newArray[i] = array[i + offsetY].slice(offsetX, offsetX + width);
    }
    return newArray;
}

function findBossRoom(rooms) {
    let bossRoom = rooms[0];
    for (const room of rooms) {
        if (room.width >= room.height && area(room) > area(bossRoom)) bossRoom = room;
    }
    return bossRoom;
}

function planPath(startRoom, rooms) {
    const maxPath = rooms.length * 0.6;
    let path = [startRoom];
    let attempt = 0;
    while (path.length < maxPath) {
        const nextRoom = randomChoice(getAdjacentRooms(path[path.length - 1], rooms).filter(r => !path.includes(r)));
        if (nextRoom === undefined) {
            if (attempt++ > 100 || path.length > 4) break;
            else path = [startRoom];
            continue;
        }
        path.push(nextRoom);
    }
    return path;
}

function getAdjacentRooms(room, rooms) {
    const adjacentRooms = [];
    for (const r of rooms) {
        if (r === room) continue;
        if (((r.offsetX === room.offsetX + room.width || room.offsetX === r.offsetX + r.width) && r.offsetY < room.offsetY + room.height - 2 && r.offsetY + r.height - 2 > room.offsetY)
            || ((r.offsetY === room.offsetY + room.height || room.offsetY === r.offsetY + r.height) && r.offsetX < room.offsetX + room.width - 2 && r.offsetX + r.width - 2 > room.offsetX)) {
            adjacentRooms.push(r);
        }
    }
    return adjacentRooms;
}

function drawPath(path) {
    for (let i = 0; i < path.length - 1; i++) {
        const startRoom = path[i];
        const endRoom = path[i + 1];
        let adjacencyPlane; //defined by two points
        if (startRoom.offsetX === endRoom.offsetX + endRoom.width)
            adjacencyPlane = [{x: startRoom.offsetX, y: startRoom.offsetY + 1},
                {x: startRoom.offsetX, y: startRoom.offsetY + startRoom.height - 2}];
        else if (endRoom.offsetX === startRoom.offsetX + startRoom.width)
            adjacencyPlane = [{x: endRoom.offsetX, y: endRoom.offsetY + 1},
                {x: endRoom.offsetX, y: endRoom.offsetY + endRoom.height - 2}];
        else if (startRoom.offsetY === endRoom.offsetY + endRoom.height)
            adjacencyPlane = [{x: startRoom.offsetX + 1, y: startRoom.offsetY},
                {x: startRoom.offsetX + startRoom.width - 2, y: startRoom.offsetY}];
        else if (endRoom.offsetY === startRoom.offsetY + startRoom.height)
            adjacencyPlane = [{x: endRoom.offsetX + 1, y: endRoom.offsetY},
                {x: endRoom.offsetX + endRoom.width - 2, y: endRoom.offsetY}];

        let primary, secondary; // adjacency plane spans across the primary axis. secondary axis doesnt change
        if (adjacencyPlane[0].x === adjacencyPlane[1].x) {
            primary = "y";
            secondary = "x";
        } else {
            primary = "x";
            secondary = "y";
        }

        let bestPoints = [adjacencyPlane[0][primary]];
        let bestPenalty = 999;
        for (let j = adjacencyPlane[0][primary] + 1; j <= adjacencyPlane[1][primary]; j++) {
            if ((primary === "y" && j >= startRoom.offsetY + 1 && j <= startRoom.offsetY + startRoom.height - 2
                && j >= endRoom.offsetY + 1 && j <= endRoom.offsetY + endRoom.height - 2)
                || (primary === "x" && j >= startRoom.offsetX + 1 && j <= startRoom.offsetX + startRoom.width - 2
                    && j >= endRoom.offsetX + 1 && j <= endRoom.offsetX + endRoom.width - 2)) {
                let penalty = 0;
                for (const sign of [-1, 1]) {
                    for (let s = sign; ; s += sign) {
                        const realS = adjacencyPlane[0][secondary] + s;
                        if ((secondary === "y" && ((realS >= startRoom.offsetY && realS <= startRoom.offsetY + startRoom.height - 1)
                            || (realS >= endRoom.offsetY && realS <= endRoom.offsetY + endRoom.height - 1)))
                            || secondary === "x" && ((realS >= startRoom.offsetX && realS <= startRoom.offsetX + startRoom.width - 1)
                                || (realS >= endRoom.offsetX && realS <= endRoom.offsetX + endRoom.width - 1))) {
                            let checkTile;
                            if (primary === "y") checkTile = level[j][realS];
                            else checkTile = level[realS][j];
                            if (checkTile === LEVEL_SYMBOLS.NONE) break;
                            else penalty++;
                        } else break;
                    }
                }
                if (penalty < bestPenalty) {
                    bestPenalty = penalty;
                    bestPoints = [j];
                } else if (penalty === bestPenalty) {
                    bestPoints.push(j);
                }
            }
        }
        const bestPoint = randomChoice(bestPoints);
        for (const sign of [-1, 1, 0]) {
            for (let s = sign; ; s += sign) {
                const realS = adjacencyPlane[0][secondary] + s;
                if ((secondary === "y" && ((realS >= startRoom.offsetY && realS <= startRoom.offsetY + startRoom.height - 1)
                    || (realS >= endRoom.offsetY && realS <= endRoom.offsetY + endRoom.height - 1)))
                    || secondary === "x" && ((realS >= startRoom.offsetX && realS <= startRoom.offsetX + startRoom.width - 1)
                        || (realS >= endRoom.offsetX && realS <= endRoom.offsetX + endRoom.width - 1))) {
                    if (primary === "y") {
                        if (level[bestPoint][realS] === LEVEL_SYMBOLS.WALL) level[bestPoint][realS] = LEVEL_SYMBOLS.NONE;
                        else break;
                    } else {
                        if (level[realS][bestPoint] === LEVEL_SYMBOLS.WALL) level[realS][bestPoint] = LEVEL_SYMBOLS.NONE;
                        else break;
                    }
                } else break;
            }
        }
    }
}

function area(room) {
    return room.width * room.height;
}

function replaceStringsWithObjects() {
    const map = [];
    for (let i = 0; i < level.length; ++i) {
        map[i] = [];
        for (let j = 0; j < level[0].length; ++j) {
            const mapCell = {
                tileType: TILE_TYPE.NONE,
                tile: null,
                hazard: null,
                entity: null,
                secondaryEntity: null,
                item: null,
                lit: false
            };
            if (level[i][j] === LEVEL_SYMBOLS.WALL) {
                mapCell.tileType = TILE_TYPE.WALL;
                mapCell.tile = new WallTile(j, i);
            } else if (level[i][j] === LEVEL_SYMBOLS.SUPER_WALL) {
                mapCell.tileType = TILE_TYPE.SUPER_WALL;
                mapCell.tile = new SuperWallTile(j, i);
            } else if (level[i][j] === LEVEL_SYMBOLS.VOID) {
                mapCell.tileType = TILE_TYPE.VOID;
            } else if (level[i][j] === LEVEL_SYMBOLS.EXIT) {
                mapCell.tileType = TILE_TYPE.EXIT;
                mapCell.tile = new TileElement(CommonSpriteSheet["exit_text.png"], j, i, true);
                //mapCell.tile.zIndex = 100;
            } else if (level[i][j] === LEVEL_SYMBOLS.BOSS_EXIT) {
                mapCell.tileType = TILE_TYPE.WALL;
                mapCell.tile = new WallTile(j, i);
                Game.bossExit = {x: j, y: i};
            }
            map[i][j] = mapCell;
        }
    }
    return map;
}

function setStartPosition(startRoom) {
    Game.startPos = {
        x: startRoom.offsetX + Math.floor(startRoom.width / 2),
        y: startRoom.offsetY + Math.floor(startRoom.height / 2)
    };
}

function setBossRoomPosition(bossRoom) {
    Game.endRoomBoundaries = [
        {x: bossRoom.offsetX, y: bossRoom.offsetY},
        {x: bossRoom.offsetX + bossRoom.width - 1, y: bossRoom.offsetY + bossRoom.height - 1}];
}

function expandLevelAndRooms(level, rooms, expandX, expandY) {
    for (const room of rooms) {
        room.offsetX += expandX;
        room.offsetY += expandY;
    }
    return expandLevel(level, expandX, expandY);
}