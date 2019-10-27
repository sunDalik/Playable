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

    return level;
}

// sometimes exceptions
function mergeRoomIntoLevel(level, room, startX, startY) {
    for (let i = startY; i < startY + room.length; ++i) {
        for (let j = startX; j < startX + room[0].length; ++j) {
            level[i][j] = room[i - startY][j - startX];
        }
    }

    return level;
}