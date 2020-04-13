import {getRandomInt, randomChoice} from "../utils/random_utils";
import {init2dArray} from "../utils/basic_utils";
import {MAP_SYMBOLS, PLANE} from "../enums";
import {Game} from "../game";
import {expandLevel, outlineWallsWithSuperWalls} from "./generation_utils";
import {shapers} from "./room_shapers";

const minRoomSize = 7;
const minRoomArea = 54;
let roomId = 0;
let level;

export function generateExperimental() {
    level = initEmptyLevel();
    const rooms = splitRoomAMAP({offsetX: 0, offsetY: 0, width: level[0].length, height: level.length, id: roomId++});
    for (const room of rooms) {
        outlineRoomWithWalls(room);
        shapeRoom(room, randomChoice(shapers));
        //shapeRoom(room, shapers[2]); //for testing
        randomlyRotateRoom(room)
    }

    Game.startPos = {x: 3, y: 3};
    replaceNumbers();
    level = expandLevel(level, 1, 1);
    outlineWallsWithSuperWalls(level);
    return level;
}

function initEmptyLevel() {
    const minLevelSize = 28;
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
                level[i + room.offsetY][j + room.offsetX] = MAP_SYMBOLS.WALL;
            }
        }
    }
}

function shapeRoom(room, shaper) {
    for (let i = 1; i < room.height - 1; i++) {
        for (let j = 1; j < room.width - 1; j++) {
            if (shaper(j, i, room.width, room.height)) {
                level[i + room.offsetY][j + room.offsetX] = MAP_SYMBOLS.WALL;
            }
        }
    }
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
                level[i][j] = MAP_SYMBOLS.VOID;
            else if (typeof level[i][j] === "number")
                level[i][j] = MAP_SYMBOLS.NONE;
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
