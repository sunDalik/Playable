"use strict";

function generateLevel() {
    let level = [[]];
    const roomNumber = randomChoice([9, 12]);
    let levelRoomWidth;
    let levelRoomHeight;
    if (roomNumber === 12) levelRoomWidth = 4;
    else levelRoomWidth = 3;
    levelRoomHeight = roomNumber / levelRoomWidth;

    let levelRooms = [];
    for (let i = 0; i < roomNumber; ++i) {
        levelRooms.push(randomChoice(rooms))
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
    for (let i = 0; i < levelRooms.length; ++i) {
        if (i % levelRoomWidth === 0) {
            previousX = 0;
            previousY += previousYMaxAddition;
            previousYMaxAddition = 0;
        }
        const currentRoom = levelRooms[i];
        const randomOffsetX = getRandomInt(3, 5);
        const randomOffsetY = getRandomInt(3, 5);
        const startX = previousX + randomOffsetX;
        const startY = previousY + randomOffsetY;
        level = mergeRoomIntoLevel(level, currentRoom, startX, startY);
        previousX = startX + currentRoom[0].length;
        if (currentRoom.length + randomOffsetY > previousYMaxAddition) previousYMaxAddition = currentRoom.length + randomOffsetY;
    }

    let entryPoints = [];
    for (let i = 0; i < level.length; ++i) {
        for (let j = 0; j < level[0].length; ++j) {
            if (level[i][j] === "entry") entryPoints.push({coords: {y: i, x: j}, connected: false});
        }
    }

    //temporary solution, in future I will add 1 more entry point to starting location
    if (entryPoints.length % 2 === 1) entryPoints.pop();

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
        let possibleConnections = [];
        for (const entry2 of entryPoints) {
            if (!entry2.connected) {
                const start = levelGraph.grid[entry.coords.y][entry.coords.x];
                const end = levelGraph.grid[entry2.coords.y][entry2.coords.x];
                const result = astar.search(levelGraph, start, end);
                possibleConnections.push({connection: result, entry: entry2});
            }
        }

        let minConnectionIndex;
        for (let i = 1; i < possibleConnections.length; ++i) {
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
            possibleConnections[minConnectionIndex].entry.connected = true;
            entry.connected = true;
            level = drawConnection(level, possibleConnections[minConnectionIndex].connection);
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
        level[connection[i].x][connection[i].y] = "";
    }
    return level;
}