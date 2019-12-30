import {Game} from "./game"
//https://github.com/qiao/PathFinding.js
import PF from "../../bower_components/pathfinding/pathfinding-browser";

import {arraySum, copy2dArray, init2dArray} from "./utils/basic_utils";
import {MAP_SYMBOLS, STAGE} from "./enums";
import {getRandomInt, randomArrayIndex, randomChoice, randomShuffle} from "./utils/random_utils";
import {get8Directions} from "./utils/map_utils";

export function generateLevel() {
    let level = [[]];
    let roomNumber;
    let levelRoomWidth;
    let levelRoomHeight;
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            roomNumber = randomChoice([12, 15, 16]);
            if (roomNumber === 12 || roomNumber === 16) levelRoomWidth = 4;
            else if (roomNumber === 15) levelRoomWidth = 5;
            break;
        case STAGE.DARK_TUNNEL:
            roomNumber = randomChoice([10, 12, 14]);
            levelRoomWidth = roomNumber / 2;
            break;
        default:
            roomNumber = randomChoice([15]);
            levelRoomWidth = 5;
            break;
    }
    levelRoomHeight = roomNumber / levelRoomWidth;

    let levelRooms = [];

    //generate starting room position
    const startRoomY = getRandomInt(0, levelRoomHeight);
    let startRoomX;
    if (startRoomY === 0 || startRoomY === levelRoomHeight - 1) startRoomX = getRandomInt(0, levelRoomWidth);
    else startRoomX = randomChoice([0, levelRoomWidth - 1]);
    const startRoomI = startRoomY * levelRoomWidth + startRoomX;

    let endingRoomX;
    let endingRoomY;
    const endingRoomWidth = getRandomInt(8, 11);
    const endingRoomHeight = getRandomInt(8, 11);
    let endingRoomEntry;
    if (startRoomX + 1 <= (levelRoomWidth + 1) / 2) endingRoomX = levelRoomWidth - 1;
    else endingRoomX = 0;
    if (startRoomY + 1 <= (levelRoomHeight + 1) / 2) {
        endingRoomY = levelRoomHeight - 1;
        endingRoomEntry = {x: getRandomInt(1, endingRoomWidth - 1), y: 0}
    } else {
        endingRoomY = 0;
        endingRoomEntry = {x: getRandomInt(1, endingRoomWidth - 1), y: endingRoomHeight - 1}
    }
    const endingRoomI = endingRoomY * levelRoomWidth + endingRoomX;
    levelRooms[endingRoomI] = createRoom(endingRoomWidth, endingRoomHeight, [endingRoomEntry]);

    //determining statue rooms indexes
    let statueRoomsNumber = randomChoice([1, 2]);
    let statueRoomIs = [];
    for (let i = 0; i < statueRoomsNumber; ++i) {
        while (true) {
            const randomI = getRandomInt(0, roomNumber);
            if (randomI !== startRoomI && randomI !== endingRoomI && !statueRoomIs.includes(randomI)) {
                statueRoomIs[i] = randomI;
                break;
            }
        }
    }

    //this will generate 2-3 chests.
    let chestRoomNumber = 4 - statueRoomsNumber;
    if (Game.stage === STAGE.DARK_TUNNEL) {
        chestRoomNumber = 3 - statueRoomsNumber
    }
    //let chestRoomNumber = 7; //for tests
    let chestRoomIs = [];
    for (let i = 0; i < chestRoomNumber; ++i) {
        while (true) {
            const randomI = getRandomInt(0, roomNumber);
            if (randomI !== startRoomI && !chestRoomIs.includes(randomI) && randomI !== endingRoomI
                && !statueRoomIs.includes(randomI)) {
                chestRoomIs[i] = randomI;
                break;
            }
        }
    }

    //determining obelisk room index
    let obeliskRoomNumber = randomChoice([1]); //this is for testing purposes. Actually there will always be only one obelisk
    let obeliskRoomIs = [];
    for (let i = 0; i < obeliskRoomNumber; ++i) {
        while (true) {
            const randomI = getRandomInt(0, roomNumber);
            if (randomI !== startRoomI && !statueRoomIs.includes(randomI) && randomI !== endingRoomI
                && !chestRoomIs.includes(randomI) && !obeliskRoomIs.includes(randomI)) {
                obeliskRoomIs[i] = randomI;
                break;
            }
        }
    }

    let normalRoomIs = [];
    //picking rooms for level
    for (let i = 0; i < roomNumber; ++i) {
        if (i !== startRoomI && i !== endingRoomI) {
            let room;
            if (statueRoomIs.includes(i)) room = randomChoice(Game.statueRooms);
            else if (obeliskRoomIs.includes(i)) room = randomChoice(Game.obeliskRooms);
            else if (chestRoomIs.includes(i)) room = randomChoice(Game.chestRooms);
            else {
                //maybe should do this for statue/chest rooms too? Not sure about that, will decide later
                while (true) {
                    const roomI = randomArrayIndex(Game.normalRooms);
                    if (!normalRoomIs.includes(roomI)) {
                        normalRoomIs.push(roomI);
                        room = Game.normalRooms[roomI];
                        break;
                    }
                }
            }

            let transformOption = getRandomInt(0, 4);
            if (obeliskRoomIs.includes(i)) transformOption = randomChoice([0, 1]);
            switch (transformOption) {
                case 1:
                    room = flipHorizontally(room);
                    break;
                case 2:
                    room = flipVertically(room);
                    break;
                case 3:
                    room = flipHorizontally(flipVertically(room));
                    break;
            }
            levelRooms[i] = room;
        }
    }

    let entryCount = 0;
    for (let r = 0; r < levelRooms.length; ++r) {
        if (levelRooms[r]) {
            for (let i = 0; i < levelRooms[r].length; ++i) {
                for (let j = 0; j < levelRooms[r][0].length; ++j) {
                    if (levelRooms[r][i][j] === MAP_SYMBOLS.ENTRY) entryCount++;
                }
            }
        }
    }

    let startRoomWidth;
    let startRoomHeight;

    let startRoomEntriesCount;
    const startRoomEntries = [];
    if (Game.stage === STAGE.DARK_TUNNEL) {
        startRoomWidth = getRandomInt(5, 7);
        startRoomHeight = getRandomInt(5, 7);
        if (entryCount % 2 === 0) startRoomEntriesCount = 2;
        else startRoomEntriesCount = 1;
        if (startRoomEntriesCount === 2) {
            if (endingRoomY === 0) startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 1), y: 0};
            else startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 1), y: startRoomHeight - 1};

            if (endingRoomX === 0) startRoomEntries[1] = {x: 0, y: getRandomInt(1, startRoomHeight - 1)};
            else startRoomEntries[1] = {x: startRoomWidth - 1, y: getRandomInt(1, startRoomHeight - 1)};

        } else if (startRoomEntriesCount === 1) {
            const option = getRandomInt(0, 2);
            if (option === 0) {
                if (endingRoomY === 0) startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 1), y: 0};
                else startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 1), y: startRoomHeight - 1};
            } else {
                if (endingRoomX === 0) startRoomEntries[0] = {x: 0, y: getRandomInt(1, startRoomHeight - 1)};
                else startRoomEntries[0] = {x: startRoomWidth - 1, y: getRandomInt(1, startRoomHeight - 1)};
            }
        }
    } else {
        startRoomWidth = getRandomInt(6, 9);
        startRoomHeight = getRandomInt(6, 9);
        if (entryCount % 2 === 0) startRoomEntriesCount = 2;
        else startRoomEntriesCount = 3;
        if (endingRoomY === 0) startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 1), y: 0};
        else startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 1), y: startRoomHeight - 1};

        if (endingRoomX === 0) startRoomEntries[1] = {x: 0, y: getRandomInt(1, startRoomHeight - 1)};
        else startRoomEntries[1] = {x: startRoomWidth - 1, y: getRandomInt(1, startRoomHeight - 1)};

        if (startRoomEntriesCount === 3) {
            const option = getRandomInt(0, 2);
            if (option === 0) {
                if (endingRoomY === 0) startRoomEntries[2] = {
                    x: getRandomInt(1, startRoomWidth - 1),
                    y: startRoomHeight - 1
                };
                else startRoomEntries[2] = {x: getRandomInt(1, startRoomWidth - 1), y: 0};
            } else {
                if (endingRoomX === 0) startRoomEntries[2] = {
                    x: startRoomWidth - 1,
                    y: getRandomInt(1, startRoomHeight - 1)
                };
                else startRoomEntries[2] = {x: 0, y: getRandomInt(1, startRoomHeight - 1)};
            }
        }
    }

    levelRooms[startRoomI] = createRoom(startRoomWidth, startRoomHeight, startRoomEntries);

    //calculating max width and total height of the level
    let levelTileWidths = [];
    let levelTileHeights = [];
    for (let i = 0; i < levelRoomHeight; ++i) {
        levelTileWidths[i] = 0;
        levelTileHeights[i] = 0;
    }

    for (let i = 0; i < levelRoomHeight; ++i) {
        for (let j = 0; j < levelRoomWidth; ++j) {
            const currentRoom = levelRooms[i * levelRoomWidth + j];
            levelTileWidths[i] += currentRoom[0].length;
            if (currentRoom.length > levelTileHeights[i]) {
                levelTileHeights[i] = currentRoom.length;
            }
        }
    }

    const minRandRoomOffset = 2;
    const maxRandRoomOffset = 3;

    const levelTileWidth = Math.max(...levelTileWidths) + maxRandRoomOffset * levelRoomWidth + 2;
    const levelTileHeight = arraySum(levelTileHeights) + maxRandRoomOffset * levelRoomHeight + 2;

    //initialize level array
    for (let i = 0; i < levelTileHeight; ++i) {
        level[i] = [];
        for (let j = 0; j < levelTileWidth; ++j) {
            level[i][j] = MAP_SYMBOLS.VOID;
        }
    }

    let previousX = 0;
    let previousY = 0;
    let previousYMaxAddition = 0;
    let entryPoints = [];
    for (let r = 0; r < levelRooms.length; ++r) {
        if (r % levelRoomWidth === 0) {
            previousX = 0;
            previousY += previousYMaxAddition;
            previousYMaxAddition = 0;
        }
        const currentRoom = levelRooms[r];
        const randomOffsetX = getRandomInt(minRandRoomOffset, maxRandRoomOffset + 1);
        const randomOffsetY = getRandomInt(minRandRoomOffset, maxRandRoomOffset + 1);
        const startX = previousX + randomOffsetX;
        const startY = previousY + randomOffsetY;
        if (r === startRoomI) {
            const startPositionX = Math.floor((startRoomWidth - 2) / 2) + 1;
            const startPositionY = Math.floor((startRoomHeight - 2) / 2) + 1;
            currentRoom[startPositionY][startPositionX] = MAP_SYMBOLS.START;
            if (Game.stage === STAGE.DARK_TUNNEL) {
                let torchX = 1;
                let torchY = 2;
                for (const entry of startRoomEntries) {
                    if (torchY === entry.y && torchX === entry.x + 1) {
                        torchX = startRoomWidth - 2;
                        break;
                    }
                }
                currentRoom[torchY][torchX] = MAP_SYMBOLS.TORCH;
            }
        } else if (r === endingRoomI) {
            currentRoom[Math.floor(endingRoomHeight / 2)][Math.floor(endingRoomWidth / 2)] = MAP_SYMBOLS.EXIT;
            const startPositionX = Math.floor(endingRoomWidth / 2) - 2; //for tests
            const startPositionY = Math.floor(endingRoomHeight / 2) - 2;
            //currentRoom[startPositionY][startPositionX] = MAP_SYMBOLS.START;
        }
        mergeRoomIntoLevel(level, currentRoom, startX, startY);

        previousX = startX + currentRoom[0].length;
        if (currentRoom.length + randomOffsetY > previousYMaxAddition) previousYMaxAddition = currentRoom.length + randomOffsetY;

        for (let i = 0; i < currentRoom.length; ++i) {
            for (let j = 0; j < currentRoom[0].length; ++j) {
                if (currentRoom[i][j] === MAP_SYMBOLS.ENTRY) entryPoints.push({
                    coords: {y: i + startY, x: j + startX},
                    connected: false,
                    room_id: r
                });
            }
        }
    }

    entryPoints = randomShuffle(entryPoints);

    const levelGraph = getLevelPathGraph(level);

    //this array contains all room connections to ensure that a room is not connected to the same other room twice through different entries
    let roomConnections = [];
    for (let i = 0; i < levelRooms.length; ++i) {
        roomConnections[i] = [];
    }

    for (const entry of entryPoints) {
        if (!entry.connected) {
            let minConnection = getMinimalConnection(levelGraph, roomConnections, entry, entryPoints);
            if (minConnection !== undefined) {
                connectEntries(minConnection.entry, entry, minConnection.connection, roomConnections, level);
            }
        }
    }

    let levelPlayerGraph = getLevelPlayerGraph(level);

    //ensure that we can reach any entry from any other entry
    for (let i = 0; i < entryPoints.length; ++i) {
        const testEntry = entryPoints[i % entryPoints.length];
        const unreachableEntries = [];
        for (const entry of entryPoints) {
            if (!(entry.coords.x === testEntry.coords.x && entry.coords.y === testEntry.coords.y)) {
                const result = Game.finder.findPath(testEntry.coords.x, testEntry.coords.y, entry.coords.x, entry.coords.y, levelPlayerGraph.clone());
                if (result.length === 0) {
                    unreachableEntries.push(entry);
                }
            }
        }
        if (unreachableEntries.length !== 0) {
            let minConnection = getMinimalConnection(levelGraph, roomConnections, testEntry, unreachableEntries, false);
            if (minConnection !== undefined) {
                connectEntries(minConnection.entry, testEntry, minConnection.connection, roomConnections, level);
            }
            levelPlayerGraph = getLevelPlayerGraph(level);
        }
    }

    //if there are any unconnected entries left then connect them already!
    for (const entry of entryPoints) {
        if (!entry.connected) {
            let minConnection = getMinimalConnection(levelGraph, roomConnections, entry, entryPoints, false);
            if (minConnection !== undefined) {
                connectEntries(minConnection.entry, entry, minConnection.connection, roomConnections, level);
            } else {
                let minConnection = getMinimalConnection(levelGraph, roomConnections, entry, entryPoints, false, true, false);
                if (minConnection !== undefined) {
                    connectEntries(minConnection.entry, entry, minConnection.connection, roomConnections, level);
                } else {
                    let minConnection = getMinimalConnection(levelGraph, roomConnections, entry, entryPoints, false, false, false);
                    if (minConnection !== undefined) {
                        connectEntries(minConnection.entry, entry, minConnection.connection, roomConnections, level);
                    }
                }
            }
        }
    }
    outlinePathsWithWalls(level);
    level = expandLevel(level, 2, 2);
    connectDiagonalPaths(level);
    outlineWallsWithWalls(level);
    outlineWallsWithSuperWalls(level);
    removeGarbage(level);
    return level;
}

function mergeRoomIntoLevel(level, room, startX, startY) {
    for (let i = startY; i < startY + room.length; ++i) {
        for (let j = startX; j < startX + room[0].length; ++j) {
            level[i][j] = room[i - startY][j - startX];
        }
    }
}

function drawConnection(level, connection) {
    //connection format is [[x1,y1], [x2,y2] ... ]
    for (let i = 0; i < connection.length; ++i) {
        if (level[connection[i][1]][connection[i][0]] !== MAP_SYMBOLS.ENTRY) {
            level[connection[i][1]][connection[i][0]] = MAP_SYMBOLS.PATH;
        }
    }
}

function getMinimalConnection(graph, roomConnections, startEntry, endEntries, hasToBeUnconnected = true, hasToBeFromDifferentRoom = true, roomsMustNotBeAlreadyConnected = true) {
    let possibleConnections = [];
    for (const entry of endEntries) {
        if (!(entry.coords.x === startEntry.coords.x && entry.coords.y === startEntry.coords.y)
            && (!entry.connected || !hasToBeUnconnected)
            && (startEntry.room_id !== entry.room_id || !hasToBeFromDifferentRoom)
            && (!isRoomConnectedToRoom(roomConnections, entry.room_id, startEntry.room_id) || !roomsMustNotBeAlreadyConnected)) {
            const result = Game.finder.findPath(startEntry.coords.x, startEntry.coords.y, entry.coords.x, entry.coords.y, graph.clone());
            possibleConnections.push({connection: result, entry: entry});
        }
    }

    let minConnectionIndex = undefined;
    for (let i = 0; i < possibleConnections.length; ++i) {
        if (minConnectionIndex === undefined) {
            if (possibleConnections[i].connection.length !== 0) {
                minConnectionIndex = i;
            }
        } else if (possibleConnections[i].connection.length < possibleConnections[minConnectionIndex].connection.length
            && possibleConnections[i].connection.length !== 0) {
            minConnectionIndex = i;
        }
    }
    if (minConnectionIndex !== undefined) {
        return possibleConnections[minConnectionIndex];
    } else return undefined;
}

function isRoomConnectedToRoom(roomConnections, roomI1, roomI2) {
    for (let i = 0; i < roomConnections[roomI1].length; ++i) {
        if (roomConnections[roomI1][i] === roomI2) {
            return true;
        }
    }
    return false;
}

function connectEntries(entry1, entry2, connection, roomConnections, level) {
    entry1.connected = true;
    entry2.connected = true;
    roomConnections[entry1.room_id].push(entry2.room_id);
    roomConnections[entry2.room_id].push(entry1.room_id);
    drawConnection(level, connection);
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

function getLevelPathGraph(level) {
    let levelWithPathWeights = [];
    for (let i = 0; i < level.length; ++i) {
        levelWithPathWeights[i] = [];
        for (let j = 0; j < level[0].length; ++j) {
            if (level[i][j] === MAP_SYMBOLS.VOID || level[i][j] === MAP_SYMBOLS.ENTRY || level[i][j] === MAP_SYMBOLS.PATH) {
                levelWithPathWeights[i][j] = 0;
            } else {
                levelWithPathWeights[i][j] = 1;
            }
        }
    }
    return new PF.Grid(levelWithPathWeights);
}

function flipHorizontally(room) {
    let newRoom = copy2dArray(room);
    for (let i = 0; i < newRoom.length; ++i) {
        for (let j = 0; j < newRoom[0].length; ++j) {
            newRoom[i][j] = room[i][room[0].length - 1 - j];
        }
    }
    return newRoom;
}

function flipVertically(room) {
    let newRoom = copy2dArray(room);
    for (let i = 0; i < newRoom.length; ++i) {
        for (let j = 0; j < newRoom[0].length; ++j) {
            newRoom[i][j] = room[room.length - 1 - i][j];
        }
    }
    return newRoom;
}

function expandLevel(level, expandX, expandY) {
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

function outlinePathsWithWalls(level) {
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

function outlineWallsWithWalls(level) {
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

function outlineWallsWithSuperWalls(level) {
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

function connectDiagonalPaths(level) {
    for (let i = 1; i < level.length - 1; ++i) {
        for (let j = 0; j < level[0].length - 1; ++j) {
            if (level[i][j] === MAP_SYMBOLS.PATH) {
                if (level[i - 1][j + 1] === MAP_SYMBOLS.PATH) {
                    let randomWall = getRandomInt(0, 2);
                    if (level[i - 1][j] === MAP_SYMBOLS.WALL && level[i][j + 1] === MAP_SYMBOLS.WALL) {
                        if (randomWall === 0) level[i - 1][j] = MAP_SYMBOLS.PATH;
                        else level[i][j + 1] = MAP_SYMBOLS.PATH;
                    }
                }
                if (level[i + 1][j + 1] === MAP_SYMBOLS.PATH) {
                    let randomWall = getRandomInt(0, 2);
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
function createRoom(width, height, entries) {
    let room = [];
    for (let i = 0; i < height; ++i) {
        room[i] = [];
        for (let j = 0; j < width; ++j) {
            if (j === 0 || j === width - 1 || i === 0 || i === height - 1) {
                room[i][j] = MAP_SYMBOLS.WALL;
            } else room[i][j] = MAP_SYMBOLS.NONE;

            //for tests
            /*if (j === width - 3 && i === height - 3) {
                room[i][j] = MAP_SYMBOLS.ALLIGATOR;
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

function removeGarbage(level) {
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