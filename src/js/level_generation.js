"use strict";

function generateLevel() {
    let level = [[]];
    const roomNumber = randomChoice([12, 15]);
    let levelRoomWidth;
    let levelRoomHeight;
    if (roomNumber === 12) levelRoomWidth = 4;
    else levelRoomWidth = 5;
    levelRoomHeight = roomNumber / levelRoomWidth;

    let levelRooms = [];
    for (let i = 0; i < roomNumber; ++i) {
        let room = randomChoice(rooms);
        let transformOption = getRandomInt(0, 4);
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
        levelRooms.push(room);
    }

    let levelTileWidths = [];
    let levelTileHeights = [];
    for (let i = 0; i < levelRoomWidth; ++i) levelTileWidths.push(0);
    for (let i = 0; i < levelRoomHeight; ++i) levelTileHeights.push(0);

    for (let i = 0; i < levelRoomHeight; ++i) {
        for (let j = 0; j < levelRoomWidth; ++j) {
            const currentRoom = levelRooms[i * levelRoomWidth + j];
            levelTileWidths[i] += currentRoom[0].length;
            if (currentRoom.length > levelTileHeights[j]) {
                levelTileHeights[j] = currentRoom.length;
            }
        }
    }

    const levelTileWidth = getMaxOfArray(levelTileWidths) + 5 * (levelRoomWidth + 1);
    const levelTileHeight = arraySum(levelTileHeights) + 5 * (levelRoomHeight + 1);

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
        const randomOffsetX = getRandomInt(2, 4);
        const randomOffsetY = getRandomInt(2, 4);
        const startX = previousX + randomOffsetX;
        const startY = previousY + randomOffsetY;
        level = mergeRoomIntoLevel(level, currentRoom, startX, startY);
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

    let oddEntry;
    if (entryPoints.length % 2 === 1) oddEntry = entryPoints.pop();

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

    for (const entry of entryPoints) {
        if (!entry.connected) {
            let minConnection = getMinimalConnection(levelGraph, entry, entryPoints);
            if (minConnection !== undefined) {
                minConnection.entry.connected = true;
                entry.connected = true;
                level = drawConnection(level, minConnection.connection);
            }
        }
    }

    if (oddEntry !== undefined) {
        let minConnection = getMinimalConnection(levelGraph, oddEntry, entryPoints, false);
        if (minConnection !== undefined) {
            oddEntry.connected = true;
            level = drawConnection(level, minConnection.connection);
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
            let minConnection = getMinimalConnection(levelGraph, testEntry, unreachableEntries, false, false);
            if (minConnection !== undefined) {
                level = drawConnection(level, minConnection.connection);
            }
            levelPlayerGraph = getLevelPlayerGraph(level);
        }
    }

    //outline paths with walls
    for (let i = 0; i < level.length; ++i) {
        for (let j = 0; j < level[0].length; ++j) {
            if (level[i][j] === "path") {
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

    return level;
}

function mergeRoomIntoLevel(level, room, startX, startY) {
    for (let i = startY; i < startY + room.length; ++i) {
        for (let j = startX; j < startX + room[0].length; ++j) {
            level[i][j] = room[i - startY][j - startX];
        }
    }
    return level;
}

function drawConnection(level, connection) {
    //[x][y] instead [y][x] because once again the Graph is weird
    for (let i = 0; i < connection.length; ++i) {
        level[connection[i].x][connection[i].y] = "path";
    }
    return level;
}

function getMinimalConnection(graph, startEntry, endEntries, hasToBeUnconnected = true, hasToBeFromDifferentRoom = true) {
    let possibleConnections = [];
    for (const entry of endEntries) {
        if (!(entry.coords.x === startEntry.coords.x && entry.coords.y === startEntry.coords.y)
            && (!entry.connected || !hasToBeUnconnected)
            && (startEntry.room_id !== entry.room_id || !hasToBeFromDifferentRoom)) {
            const start = graph.grid[startEntry.coords.y][startEntry.coords.x];
            const end = graph.grid[entry.coords.y][entry.coords.x];
            const result = astar.search(graph, start, end);
            possibleConnections.push({connection: result, entry: entry});
        }
    }

    let minConnectionIndex;
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

//turned out to be unnecessary but maaaaybeee will be useful later..?
function expandLevel(level, expandX, expandY) {
    let expandedLevel = [];
    for (let i = 0; i < level.length + expandY; ++i) {
        expandedLevel[i] = [];
        for (let j = 0; j < level[0].length + expandX; ++j) {
            if (i < expandY || j < expandX) {
                expandedLevel[i][j] = "v";
            } else {
                expandedLevel[i][j] = level[i - expandY][j - expandX];
            }
        }
    }
    return expandedLevel;
}
