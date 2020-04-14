import {Game} from "../game"
//https://github.com/qiao/PathFinding.js
import PF from "../../../bower_components/pathfinding/pathfinding-browser";

import {arraySum, copy2dArray, init2dArray, removeObjectFromArray} from "../utils/basic_utils";
import {LEVEL_SYMBOLS, STAGE} from "../enums";
import {getRandomInt, randomArrayIndex, randomChoice, randomShuffle} from "../utils/random_utils";
import {
    connectDiagonalPaths,
    createRoom,
    expandLevel,
    flipHorizontally,
    flipVertically,
    getLevelPlayerGraph,
    mergeRoomIntoLevel,
    outlinePathsWithWalls,
    outlineWallsWithSuperWalls,
    outlineWallsWithWalls,
    removeGarbage
} from "./generation_utils";

const bossAreas = [STAGE.FLOODED_CAVE, STAGE.DARK_TUNNEL];

export function generateEntryBasedLevel() {
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
            roomNumber = randomChoice([12, 14, 16]);
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
    const startRoomY = getRandomInt(0, levelRoomHeight - 1);
    let startRoomX;
    if (startRoomY === 0 || startRoomY === levelRoomHeight - 1) {
        startRoomX = getRandomInt(0, levelRoomWidth - 1);
        if (Game.stage === STAGE.DARK_TUNNEL) {
            startRoomX = randomChoice([0, 1, levelRoomWidth - 2, levelRoomWidth - 1]);
        }
    } else startRoomX = randomChoice([0, levelRoomWidth - 1]);
    const startRoomI = startRoomY * levelRoomWidth + startRoomX;

    let endingRoomX;
    let endingRoomY;
    let endingRoomWidth = getRandomInt(12, 13);
    let endingRoomHeight = getRandomInt(8, 10);
    let endingRoomEntry;
    if (startRoomX + 1 <= (levelRoomWidth + 1) / 2) endingRoomX = levelRoomWidth - 1;
    else endingRoomX = 0;
    if (startRoomY + 1 <= (levelRoomHeight + 1) / 2) {
        endingRoomY = levelRoomHeight - 1;
        endingRoomEntry = {x: Math.floor(endingRoomWidth / 2), y: 0}
    } else {
        endingRoomY = 0;
        endingRoomEntry = {x: Math.floor(endingRoomWidth / 2), y: endingRoomHeight - 1}
    }
    const endingRoomI = endingRoomY * levelRoomWidth + endingRoomX;
    levelRooms[endingRoomI] = createRoom(endingRoomWidth, endingRoomHeight, [endingRoomEntry]);
    if (bossAreas.includes(Game.stage)) {
        levelRooms[endingRoomI] = copy2dArray(randomChoice(Game.bossRooms));
        endingRoomWidth = levelRooms[endingRoomI][0].length;
        endingRoomHeight = levelRooms[endingRoomI].length;
        //copy paste...
        if (startRoomY + 1 <= (levelRoomHeight + 1) / 2) endingRoomEntry = {x: Math.floor(endingRoomWidth / 2), y: 0};
        else endingRoomEntry = {x: Math.floor(endingRoomWidth / 2), y: endingRoomHeight - 1};

        levelRooms[endingRoomI][endingRoomEntry.y][endingRoomEntry.x] = LEVEL_SYMBOLS.ENTRY;
    }

    //determining statue rooms indexes
    let statueRoomsNumber = randomChoice([1, 2]);
    let statueRoomIs = [];
    for (let i = 0; i < statueRoomsNumber; ++i) {
        while (true) {
            const randomI = getRandomInt(0, roomNumber - 1);
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
            const randomI = getRandomInt(0, roomNumber - 1);
            if (randomI !== startRoomI && !chestRoomIs.includes(randomI) && randomI !== endingRoomI
                && !statueRoomIs.includes(randomI)) {
                chestRoomIs[i] = randomI;
                break;
            }
        }
    }

    //determining obelisk room index
    let obeliskRoomNumber = 1;
    let obeliskRoomIs = []; //this is for testing purposes. Actually there will always be only one obelisk
    for (let i = 0; i < obeliskRoomNumber; ++i) {
        while (true) {
            const randomI = getRandomInt(0, roomNumber - 1);
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

            room = copy2dArray(room);
            let transformOption = getRandomInt(0, 3);
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
                    if (levelRooms[r][i][j] === LEVEL_SYMBOLS.ENTRY) entryCount++;
                }
            }
        }
    }

    let startRoomWidth;
    let startRoomHeight;

    let startRoomEntriesCount;
    const startRoomEntries = [];
    if (Game.stage === STAGE.DARK_TUNNEL) {
        startRoomWidth = getRandomInt(5, 6);
        startRoomHeight = getRandomInt(5, 6);
        if (entryCount % 2 === 0) startRoomEntriesCount = 2;
        else startRoomEntriesCount = 1;
        if (startRoomEntriesCount === 2) {
            if (endingRoomY === 0) startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 2), y: 0};
            else startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 2), y: startRoomHeight - 1};

            if (endingRoomX === 0) startRoomEntries[1] = {x: 0, y: getRandomInt(1, startRoomHeight - 2)};
            else startRoomEntries[1] = {x: startRoomWidth - 1, y: getRandomInt(1, startRoomHeight - 2)};

        } else if (startRoomEntriesCount === 1) {
            const option = getRandomInt(0, 1);
            if (option === 0) {
                if (endingRoomY === 0) startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 2), y: 0};
                else startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 2), y: startRoomHeight - 1};
            } else {
                if (endingRoomX === 0) startRoomEntries[0] = {x: 0, y: getRandomInt(1, startRoomHeight - 2)};
                else startRoomEntries[0] = {x: startRoomWidth - 1, y: getRandomInt(1, startRoomHeight - 2)};
            }
        }
    } else {
        startRoomWidth = getRandomInt(5, 7);
        startRoomHeight = getRandomInt(5, 7);
        if (entryCount % 2 === 0) startRoomEntriesCount = 2;
        else startRoomEntriesCount = 3;
        if (endingRoomY === 0) startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 2), y: 0};
        else startRoomEntries[0] = {x: getRandomInt(1, startRoomWidth - 2), y: startRoomHeight - 1};

        if (endingRoomX === 0) startRoomEntries[1] = {x: 0, y: getRandomInt(1, startRoomHeight - 2)};
        else startRoomEntries[1] = {x: startRoomWidth - 1, y: getRandomInt(1, startRoomHeight - 2)};

        if (startRoomEntriesCount === 3) {
            const option = getRandomInt(0, 1);
            if (option === 0) {
                if (endingRoomY === 0) startRoomEntries[2] = {
                    x: getRandomInt(1, startRoomWidth - 2),
                    y: startRoomHeight - 1
                };
                else startRoomEntries[2] = {x: getRandomInt(1, startRoomWidth - 2), y: 0};
            } else {
                if (endingRoomX === 0) startRoomEntries[2] = {
                    x: startRoomWidth - 1,
                    y: getRandomInt(1, startRoomHeight - 2)
                };
                else startRoomEntries[2] = {x: 0, y: getRandomInt(1, startRoomHeight - 2)};
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
    level = init2dArray(levelTileHeight, levelTileWidth, LEVEL_SYMBOLS.VOID);

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
        let currentRoom = levelRooms[r];
        const randomOffsetX = getRandomInt(minRandRoomOffset, maxRandRoomOffset);
        const randomOffsetY = getRandomInt(minRandRoomOffset, maxRandRoomOffset);
        const startX = previousX + randomOffsetX;
        const startY = previousY + randomOffsetY;
        if (r === startRoomI) {
            const startPositionX = Math.floor((startRoomWidth - 2) / 2) + 1;
            const startPositionY = Math.floor((startRoomHeight - 2) / 2) + 1;
            currentRoom[startPositionY][startPositionX] = LEVEL_SYMBOLS.START;
            if (Game.stage === STAGE.DARK_TUNNEL) {
                let torchX = 1;
                let torchY = 2;
                for (const entry of startRoomEntries) {
                    if (torchY === entry.y && torchX === entry.x + 1) {
                        torchX = startRoomWidth - 2;
                        break;
                    }
                }
                currentRoom[torchY][torchX] = LEVEL_SYMBOLS.TORCH;
            }
        } else if (r === endingRoomI) {
            if (!bossAreas.includes(Game.stage)) {
                currentRoom[Math.floor(endingRoomHeight / 2)][Math.floor(endingRoomWidth / 2)] = LEVEL_SYMBOLS.EXIT;
            }

            const startPositionX = Math.floor(endingRoomWidth / 2) - 2; //for tests
            const startPositionY = Math.floor(endingRoomHeight / 2) - 2;
            //currentRoom[startPositionY][startPositionX] = LEVEL_SYMBOLS.START;

            currentRoom[0][0] += ":" + LEVEL_SYMBOLS.END_ROOM_BOUNDARY;
            currentRoom[endingRoomHeight - 1][endingRoomWidth - 1] += ":" + LEVEL_SYMBOLS.END_ROOM_BOUNDARY;

            if (bossAreas.includes(Game.stage)) {
                if (endingRoomEntry.y === 0) {
                    level[startY + endingRoomHeight][startX + endingRoomEntry.x] = LEVEL_SYMBOLS.BOSS_EXIT;
                } else if (endingRoomEntry.y === endingRoomHeight - 1) {
                    level[startY - 1][startX + endingRoomEntry.x] = LEVEL_SYMBOLS.BOSS_EXIT;
                }
                //currentRoom[Math.floor(endingRoomHeight / 2) + 2][Math.floor(endingRoomWidth / 2) + 2] = LEVEL_SYMBOLS.PARANOID_EEL;
                //currentRoom[Math.floor(endingRoomHeight / 2)][Math.floor(endingRoomWidth / 2) + 2] = LEVEL_SYMBOLS.GUARDIAN_OF_THE_LIGHT;
            }
        }
        mergeRoomIntoLevel(level, currentRoom, startX, startY);

        previousX = startX + currentRoom[0].length;
        if (currentRoom.length + randomOffsetY > previousYMaxAddition) previousYMaxAddition = currentRoom.length + randomOffsetY;

        for (let i = 0; i < currentRoom.length; ++i) {
            for (let j = 0; j < currentRoom[0].length; ++j) {
                if (currentRoom[i][j] === LEVEL_SYMBOLS.ENTRY) entryPoints.push({
                    coords: {y: i + startY, x: j + startX},
                    connected: false,
                    room_id: r
                });
            }
        }
    }

    randomShuffle(entryPoints);

    const levelGraph = getLevelPathGraph(level);

    //this array contains all room connections to ensure that a room is not connected to the same other room twice through different entries
    let roomConnections = [];
    for (let i = 0; i < levelRooms.length; ++i) {
        roomConnections[i] = [];
    }

    for (let i = entryPoints.length - 1; i >= 0; i--) {
        const entry = entryPoints[i];
        if (!entry.connected) {
            let minConnection = getMinimalConnection(levelGraph, roomConnections, entry, entryPoints);
            if (minConnection !== undefined) {
                if (minConnection.connection.length > Math.min(levelTileWidth, levelTileHeight) * 0.32 && entryPoints.filter(e => e.room_id === entry.room_id).length > 1) {
                    removeObjectFromArray(entry, entryPoints);
                    level[entry.coords.y][entry.coords.x] = LEVEL_SYMBOLS.WALL;
                } else
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
    level = expandLevel(level, 3, 3);
    outlinePathsWithWalls(level);
    connectDiagonalPaths(level);
    outlineWallsWithWalls(level);
    outlineWallsWithSuperWalls(level);
    removeGarbage(level);
    return level;
}

function drawConnection(level, connection) {
    //connection format is [[x1,y1], [x2,y2] ... ]
    for (let i = 0; i < connection.length; ++i) {
        if (level[connection[i][1]][connection[i][0]] !== LEVEL_SYMBOLS.ENTRY) {
            level[connection[i][1]][connection[i][0]] = LEVEL_SYMBOLS.PATH;
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

function getLevelPathGraph(level) {
    let levelWithPathWeights = [];
    for (let i = 0; i < level.length; ++i) {
        levelWithPathWeights[i] = [];
        for (let j = 0; j < level[0].length; ++j) {
            if (level[i][j] === LEVEL_SYMBOLS.VOID || level[i][j] === LEVEL_SYMBOLS.ENTRY || level[i][j] === LEVEL_SYMBOLS.PATH) {
                levelWithPathWeights[i][j] = 0;
            } else {
                levelWithPathWeights[i][j] = 1;
            }
        }
    }
    return new PF.Grid(levelWithPathWeights);
}