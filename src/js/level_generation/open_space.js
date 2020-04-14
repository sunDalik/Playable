import {Game} from "../game";
import {LEVEL_SYMBOLS} from "../enums";
import {getRandomInt, randomArrayIndex, randomChoice, randomChoiceSeveral} from "../utils/random_utils";
import {
    createRoom,
    expandLevel,
    flipHorizontally,
    flipVertically,
    mergeRoomIntoLevel,
    outlineWallsWithSuperWalls,
    removeGarbage
} from "./generation_utils";
import {arraySum, copy2dArray, init2dArray} from "../utils/basic_utils";
import {get8Directions} from "../utils/map_utils";

export function generateOpenSpaceLevel() {
    let level = [[]];
    const roomNumber = randomChoice([15, 20]);
    const levelRoomWidth = 5;
    const levelRoomHeight = roomNumber / levelRoomWidth;

    let levelRooms = [];

    //generate starting room position
    const startRoomY = getRandomInt(0, levelRoomHeight - 1);
    let startRoomX;
    if (startRoomY === 0 || startRoomY === levelRoomHeight - 1) startRoomX = getRandomInt(0, levelRoomWidth - 1);
    else startRoomX = randomChoice([0, levelRoomWidth - 1]);
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
    if (false && bossAreas.includes(Game.stage)) {
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
            const width = getRandomInt(7, 9);
            const height = getRandomInt(7, 9);
            const enemies = randomChoiceSeveral(getRoomInsideArray(width, height), getRandomInt(3, 5));
            for (const enemy of enemies) {
                enemy.symbol = randomChoice([LEVEL_SYMBOLS.PING_PONG_BUDDIES, LEVEL_SYMBOLS.WALL_SLIME, LEVEL_SYMBOLS.LIZARD_WARRIOR, LEVEL_SYMBOLS.MUD_MAGE, LEVEL_SYMBOLS.TELEPORT_MAGE])
            }
            levelRooms[i] = createRoomWithEnemies(width, height, enemies, LEVEL_SYMBOLS.NONE);
            continue;

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

    let startRoomWidth;
    let startRoomHeight;
    startRoomWidth = getRandomInt(5, 7);
    startRoomHeight = getRandomInt(5, 7);
    levelRooms[startRoomI] = createRoom(startRoomWidth, startRoomHeight, [], LEVEL_SYMBOLS.NONE);

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
    level = init2dArray(levelTileHeight, levelTileWidth, LEVEL_SYMBOLS.PATH);

    let previousX = 0;
    let previousY = 0;
    let previousYMaxAddition = 0;
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

        } else if (r === endingRoomI) {
            currentRoom[Math.floor(endingRoomHeight / 2)][Math.floor(endingRoomWidth / 2)] = LEVEL_SYMBOLS.EXIT;

            const startPositionX = Math.floor(endingRoomWidth / 2) - 2; //for tests
            const startPositionY = Math.floor(endingRoomHeight / 2) - 2;
            //currentRoom[startPositionY][startPositionX] = LEVEL_SYMBOLS.START;

            currentRoom[0][0] += ":" + LEVEL_SYMBOLS.END_ROOM_BOUNDARY;
            currentRoom[endingRoomHeight - 1][endingRoomWidth - 1] += ":" + LEVEL_SYMBOLS.END_ROOM_BOUNDARY;

            if (false && bossAreas.includes(Game.stage)) {
                if (endingRoomEntry.y === 0) {
                    level[startY + endingRoomHeight][startX + endingRoomEntry.x] = LEVEL_SYMBOLS.BOSS_EXIT;
                } else if (endingRoomEntry.y === endingRoomHeight - 1) {
                    level[startY - 1][startX + endingRoomEntry.x] = LEVEL_SYMBOLS.BOSS_EXIT;
                }
            }
        }
        mergeRoomIntoLevel(level, currentRoom, startX, startY);

        previousX = startX + currentRoom[0].length;
        if (currentRoom.length + randomOffsetY > previousYMaxAddition) previousYMaxAddition = currentRoom.length + randomOffsetY;
    }


    level = expandLevel(level, 2, 2);
    outlineLevelWithWalls(level);
    outlineWallsWithSuperWalls(level);
    removeGarbage(level);
    return level;
}

function outlineLevelWithWalls(level) {
    for (let i = 1; i < level.length - 1; ++i) {
        for (let j = 1; j < level[0].length - 1; ++j) {
            if (level[i][j] === LEVEL_SYMBOLS.NONE || level[i][j] === LEVEL_SYMBOLS.PATH) {
                for (const dir of get8Directions()) {
                    if (level[i + dir.y][j + dir.x] === LEVEL_SYMBOLS.VOID) {
                        level[i + dir.y][j + dir.x] = LEVEL_SYMBOLS.WALL
                    }
                }
            }
        }
    }
}

function getRoomInsideArray(width, height) {
    const inside = [];
    for (let x = 1; x < width; x++) {
        for (let y = 1; y < height; y++) {
            inside.push({x: x, y: y});
        }
    }
    return inside;
}

function createRoomWithEnemies(width, height, enemies, wallSymbol = LEVEL_SYMBOLS.NONE) {
    let room = [];
    for (let i = 0; i < height; ++i) {
        room[i] = [];
        for (let j = 0; j < width; ++j) {
            if (j === 0 || j === width - 1 || i === 0 || i === height - 1) {
                room[i][j] = wallSymbol;
            } else room[i][j] = LEVEL_SYMBOLS.NONE;

            for (const enemy of enemies) {
                if (i === enemy.y && j === enemy.x) {
                    room[i][j] = enemy.symbol;
                }
            }
        }
    }
    return room;
}