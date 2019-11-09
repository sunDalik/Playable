"use strict";

function generateLevel() {
    let level = [[]];
    //set different parameters for dark tunnel
    const roomNumber = randomChoice([12, 15, 16]);
    let levelRoomWidth;
    let levelRoomHeight;
    if (roomNumber === 12 || roomNumber === 16) levelRoomWidth = 4;
    else if (roomNumber === 15) levelRoomWidth = 5;
    levelRoomHeight = roomNumber / levelRoomWidth;

    let levelRooms = [];

    //generate starting room position
    const startRoomY = getRandomInt(0, levelRoomHeight);
    let startRoomX;
    if (startRoomY === 0 || startRoomY === levelRoomHeight - 1) startRoomX = getRandomInt(0, levelRoomWidth);
    else startRoomX = randomChoice([0, levelRoomWidth - 1]);
    const startRoomI = startRoomY * levelRoomWidth + startRoomX;
    let startRoom = [];
    levelRooms[startRoomI] = startRoom;

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
    let endingRoom = [];
    levelRooms[endingRoomI] = endingRoom;

    for (let i = 0; i < endingRoomHeight; ++i) {
        endingRoom[i] = [];
        for (let j = 0; j < endingRoomWidth; ++j) {
            if (j === 0 || j === endingRoomWidth - 1 || i === 0 || i === endingRoomHeight - 1) {
                endingRoom[i][j] = "w";
            } else endingRoom[i][j] = "";
            if (i === endingRoomEntry.y && j === endingRoomEntry.x) {
                endingRoom[i][j] = "entry";
            }
        }
    }

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
        for (let i = 0; i < levelRooms[r].length; ++i) {
            for (let j = 0; j < levelRooms[r][0].length; ++j) {
                if (levelRooms[r][i][j] === "entry") entryCount++;
            }
        }
    }

    let startRoomEntriesCount;
    if (entryCount % 2 === 0) startRoomEntriesCount = 2;
    else startRoomEntriesCount = 3;

    const startRoomWidth = getRandomInt(6, 9);
    const startRoomHeight = getRandomInt(6, 9);

    const startRoomEntries = [];
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

    for (let i = 0; i < startRoomHeight; ++i) {
        startRoom[i] = [];
        for (let j = 0; j < startRoomWidth; ++j) {
            if (j === 0 || j === startRoomWidth - 1 || i === 0 || i === startRoomHeight - 1) {
                startRoom[i][j] = "w";
            } else startRoom[i][j] = "";
            for (const entry of startRoomEntries) {
                if (i === entry.y && j === entry.x) {
                    startRoom[i][j] = "entry";
                }
            }
        }
    }

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

    const levelTileWidth = getMaxOfArray(levelTileWidths) + maxRandRoomOffset * levelRoomWidth + 2;
    const levelTileHeight = arraySum(levelTileHeights) + maxRandRoomOffset * levelRoomHeight + 2;

    //initialize level array
    for (let i = 0; i < levelTileHeight; ++i) {
        level[i] = [];
        for (let j = 0; j < levelTileWidth; ++j) {
            level[i][j] = "v";
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
        mergeRoomIntoLevel(level, currentRoom, startX, startY);
        if (r === startRoomI) {
            Game.startX = startX + Math.floor(startRoomWidth / 2) - 1;
            Game.startY = startY + Math.floor(startRoomHeight / 2) - 1;
        } else if (r === endingRoomI) {
            level[startY + Math.floor(endingRoomHeight / 2)][startX + Math.floor(endingRoomWidth / 2)] = "exit";
            //Game.startX = startX + Math.floor(endingRoomWidth / 2) - 2; //for tests
            //Game.startY = startY + Math.floor(endingRoomHeight / 2) - 2;
        }

        previousX = startX + currentRoom[0].length;
        if (currentRoom.length + randomOffsetY > previousYMaxAddition) previousYMaxAddition = currentRoom.length + randomOffsetY;

        for (let i = 0; i < currentRoom.length; ++i) {
            for (let j = 0; j < currentRoom[0].length; ++j) {
                if (currentRoom[i][j] === "entry") entryPoints.push({
                    coords: {y: i + startY, x: j + startX},
                    connected: false,
                    room_id: r
                });
            }
        }
    }

    entryPoints = randomShuffle(entryPoints);

    // the Graph class is weird, levelGraph.grid.length will return number of Xs and levelGraph.grid[0].length number of Ys
    let levelGraph = new Graph(level);
    for (let i = 0; i < levelGraph.grid.length; ++i) {
        for (let j = 0; j < levelGraph.grid[0].length; ++j) {
            if (levelGraph.grid[i][j].weight === "v" || levelGraph.grid[i][j].weight === "entry") {
                levelGraph.grid[i][j].weight = 1;
            } else {
                levelGraph.grid[i][j].weight = 0;
            }
        }
    }

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
                const start = levelPlayerGraph.grid[testEntry.coords.y][testEntry.coords.x];
                const end = levelPlayerGraph.grid[entry.coords.y][entry.coords.x];
                const result = astar.search(levelPlayerGraph, start, end);
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

    level = expandLevel(level, 1, 1);
    outlineWallsWithSuperWalls(level);

    // remove walls between paths that connect diagonally
    for (let i = 1; i < level.length - 1; ++i) {
        for (let j = 0; j < level[0].length - 1; ++j) {
            if (level[i][j] === "path") {
                if (level[i - 1][j + 1] === "path") {
                    let randomWall = getRandomInt(0, 2);
                    if (level[i - 1][j] === "w" && level[i][j + 1] === "w") {
                        if (randomWall === 0) level[i - 1][j] = "path";
                        else level[i][j + 1] = "path";
                    }
                }
                if (level[i + 1][j + 1] === "path") {
                    let randomWall = getRandomInt(0, 2);
                    if (level[i + 1][j] === "w" && level[i][j + 1] === "w") {
                        if (randomWall === 0) level[i + 1][j] = "path";
                        else level[i][j + 1] = "path";
                    }
                }
            }
        }
    }

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
    //[x][y] instead [y][x] because once again the Graph is weird
    for (let i = 0; i < connection.length; ++i) {
        if (level[connection[i].x][connection[i].y] !== "entry") {
            level[connection[i].x][connection[i].y] = "path";
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
            const start = graph.grid[startEntry.coords.y][startEntry.coords.x];
            const end = graph.grid[entry.coords.y][entry.coords.x];
            const result = astar.search(graph, start, end);
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

//you will have to update it if you will use it (look at calculateDetectionGraph)
function getLevelPlayerGraph(level) {
    //graph where weights correspond to player's movement ability
    let levelPlayerGraph = new Graph(level);
    for (let i = 0; i < levelPlayerGraph.grid.length; ++i) {
        for (let j = 0; j < levelPlayerGraph.grid[0].length; ++j) {
            if (levelPlayerGraph.grid[i][j].weight === "v" || levelPlayerGraph.grid[i][j].weight === "w") {
                levelPlayerGraph.grid[i][j].weight = 0;
            } else {
                levelPlayerGraph.grid[i][j].weight = 1;
            }
        }
    }
    return levelPlayerGraph;
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
                expandedLevel[i][j] = "v";
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
            if (level[i][j] === "path" || level[i][j] === "entry") {
                if (level[i + 1][j] === "v") level[i + 1][j] = "w";
                if (level[i][j + 1] === "v") level[i][j + 1] = "w";
                if (level[i + 1][j + 1] === "v") level[i + 1][j + 1] = "w";
                if (level[i - 1][j] === "v") level[i - 1][j] = "w";
                if (level[i][j - 1] === "v") level[i][j - 1] = "w";
                if (level[i - 1][j - 1] === "v") level[i - 1][j - 1] = "w";
                if (level[i - 1][j + 1] === "v") level[i - 1][j + 1] = "w";
                if (level[i + 1][j - 1] === "v") level[i + 1][j - 1] = "w";
            }
        }
    }
}

function outlineWallsWithSuperWalls(level) {
    for (let i = 1; i < level.length - 1; ++i) {
        for (let j = 1; j < level[0].length - 1; ++j) {
            if (level[i][j] === "w") {
                if (level[i + 1][j] === "v") level[i + 1][j] = "sw";
                if (level[i][j + 1] === "v") level[i][j + 1] = "sw";
                if (level[i + 1][j + 1] === "v") level[i + 1][j + 1] = "sw";
                if (level[i - 1][j] === "v") level[i - 1][j] = "sw";
                if (level[i][j - 1] === "v") level[i][j - 1] = "sw";
                if (level[i - 1][j - 1] === "v") level[i - 1][j - 1] = "sw";
                if (level[i - 1][j + 1] === "v") level[i - 1][j + 1] = "sw";
                if (level[i + 1][j - 1] === "v") level[i + 1][j - 1] = "sw";
            }
        }
    }
}