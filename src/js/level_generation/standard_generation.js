import {randomChoice, randomInt} from "../utils/random_utils";
import {init2dArray, removeObjectFromArray} from "../utils/basic_utils";
import {LEVEL_SYMBOLS, PLANE, ROLE, STAGE, TILE_TYPE} from "../enums";
import {Game} from "../game";
import {expandLevel, outlineWallsWithSuperWalls} from "./generation_utils";
import {comboShapers, shapers} from "./room_shapers";
import {WallTile} from "../classes/draw/wall";
import {SuperWallTile} from "../classes/draw/super_wall";
import {Room, ROOM_TYPE} from "./room";
import {Chest} from "../classes/inanimate_objects/chest";
import {getRandomChestDrop, getRandomSpell, getRandomWeapon} from "../utils/pool_utils";
import {Statue} from "../classes/inanimate_objects/statue";
import {get8Directions, getCardinalDirections} from "../utils/map_utils";
import {Necromancy} from "../classes/equipment/magic/necromancy";
import {Obelisk} from "../classes/inanimate_objects/obelisk";
import {pointTileDistance} from "../utils/game_utils";
import {SpikyWallTrap} from "../classes/enemies/fc/spiky_wall_trap";
import {DoorsTile} from "../classes/draw/doors";
import {Mushroom} from "../classes/enemies/fc/mushroom";
import {LyingItem} from "../classes/equipment/lying_item";
import {Torch} from "../classes/equipment/tools/torch";
import {Roller} from "../classes/enemies/fc/roller";
import {Key} from "../classes/equipment/key";

let settings;
let level;
let rooms;

//these are set later
let chestsAmount = 0;
export let keysOnEnemies = 0;

//you HAVE to setup settings before you use generator
export function setupGenerator(generatorSettings) {
    settings = generatorSettings;
}

//todo add boss
export function generateStandard() {
    level = initEmptyLevel();
    rooms = splitRoomAMAP(new Room(0, 0, level[0].length, level.length));
    for (const room of rooms) {
        if (!settings.openSpace) outlineRoomWithWalls(room);
        if (Math.random() > 0.4) shapeRoom(room, randomChoice(comboShapers));
        else shapeRoom(room, randomChoice(shapers));
        //shapeRoom(room, shapers[5]); //for testing
        //shapeRoom(room, randomChoice(shapers)); //for testing
        randomlyRotateRoom(room);
    }
    if (settings.openSpace) outlineLevelWithWalls();
    const bossRoom = findBossRoom();
    clearShape(bossRoom);
    const path = planPath(bossRoom);

    const startRoom = path[path.length - 1];
    path.forEach(r => r.type = ROOM_TYPE.MAIN);
    bossRoom.type = ROOM_TYPE.BOSS;
    startRoom.type = ROOM_TYPE.START;
    drawPath(path);
    const unconnectedRooms = rooms.filter(room => !path.includes(room));
    unconnectedRooms.forEach(r => r.type = ROOM_TYPE.SECONDARY);
    let attempt = 0;
    const secretRoomsAmount = Game.stage === STAGE.FLOODED_CAVE ? 0 : 0;
    while (unconnectedRooms.length > secretRoomsAmount) {
        const room = randomChoice(unconnectedRooms);
        const nextRoom = randomChoice(getAdjacentRooms(room).filter(r => !unconnectedRooms.includes(r) && r !== bossRoom));
        if (nextRoom === undefined) {
            if (attempt++ > 200) break;
        } else {
            drawPath([room, nextRoom]);
            removeObjectFromArray(room, unconnectedRooms);
        }
    }
    for (const secretRoom of unconnectedRooms) {
        secretRoom.type = ROOM_TYPE.SECRET;
        reshapeRoom(secretRoom, shapers[1]);
    }
    level = expandLevelAndRooms(1, 1);
    outlineWallsWithSuperWalls(level);

    //level shaping is finished
    level = replaceStringsWithObjects();
    generateInanimates();
    generateEnemies();
    generateBoss();
    generateKeys();
    setStartPosition(startRoom);
    setBossRoomPosition(bossRoom);
    return level;
}

function initEmptyLevel() {
    const width = randomInt(settings.minLevelWidth, settings.maxLevelWidth);
    const height = randomInt(settings.minLevelHeight, settings.maxLevelHeight);
    return init2dArray(height, width, LEVEL_SYMBOLS.NONE);
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
        const dividerX = dividingPlane === PLANE.VERTICAL ? randomInt(settings.minRoomSize - 1, width - settings.minRoomSize - 1) : -1;
        const dividerY = dividingPlane === PLANE.HORIZONTAL ? randomInt(settings.minRoomSize - 1, height - settings.minRoomSize - 1) : -1;
        let rooms = [];
        if (dividingPlane === PLANE.HORIZONTAL) {
            rooms[0] = new Room(offsetX, offsetY, width, dividerY + 1);
            rooms[1] = new Room(offsetX, offsetY + rooms[0].height, width, height - rooms[0].height);
        } else {
            rooms[0] = new Room(offsetX, offsetY, dividerX + 1, height);
            rooms[1] = new Room(offsetX + rooms[0].width, offsetY, width - rooms[0].width, height);
        }

        if (isRoomGood(rooms[0].width, rooms[0].height) && isRoomGood(rooms[1].width, rooms[1].height)) {
            return rooms;
        }
    }
    return null;
}

function canBeDivided(width, height) {
    return isRoomGood(Math.floor(width / 2), height) || isRoomGood(width, Math.floor(height / 2));
}

function isRoomGood(width, height) {
    const minDimension = Math.min(width, height);
    const area = width * height;
    return minDimension >= settings.minRoomSize && area >= settings.minRoomArea;
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
    const transformOption = randomInt(0, 3);
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

function copyPartOf2dArray(array, offsetX, offsetY, width, height) {
    const newArray = [];
    for (let i = 0; i < height; i++) {
        newArray[i] = array[i + offsetY].slice(offsetX, offsetX + width);
    }
    return newArray;
}

function findBossRoom() {
    let bossRoom = rooms[0];
    for (const room of rooms) {
        if (room.width >= room.height && room.area() > bossRoom.area()) bossRoom = room;
    }
    return bossRoom;
}

function planPath(startRoom) {
    const maxPath = rooms.length * 0.6;
    let path = [startRoom];
    let attempt = 0;
    while (path.length < maxPath) {
        const nextRoom = randomChoice(getAdjacentRooms(path[path.length - 1]).filter(r => !path.includes(r)));
        if (nextRoom === undefined) {
            if (attempt++ > 100 || path.length > 4) break;
            else path = [startRoom];
            continue;
        }
        path.push(nextRoom);
    }
    return path;
}

function getAdjacentRooms(room) {
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

//this is messy AND not always efficient
function drawPath(path) {
    for (let i = 0; i < path.length - 1; i++) {
        const startRoom = path[i];
        const endRoom = path[i + 1];
        let adjacencyPlane; //defined by two points
        if (startRoom.offsetX === endRoom.offsetX + endRoom.width)
            adjacencyPlane = [{x: startRoom.offsetX, y: startRoom.offsetY + 1},
                {x: startRoom.offsetX, y: startRoom.offsetY + startRoom.height - 2}];
        else if (endRoom.offsetX === startRoom.offsetX + startRoom.width)
            adjacencyPlane = [{x: startRoom.offsetX + startRoom.width - 1, y: endRoom.offsetY + 1},
                {x: startRoom.offsetX + startRoom.width - 1, y: endRoom.offsetY + endRoom.height - 2}];
        else if (startRoom.offsetY === endRoom.offsetY + endRoom.height)
            adjacencyPlane = [{x: startRoom.offsetX + 1, y: startRoom.offsetY},
                {x: startRoom.offsetX + startRoom.width - 2, y: startRoom.offsetY}];
        else if (endRoom.offsetY === startRoom.offsetY + startRoom.height)
            adjacencyPlane = [{x: endRoom.offsetX + 1, y: startRoom.offsetY + startRoom.height - 1},
                {x: endRoom.offsetX + endRoom.width - 2, y: startRoom.offsetY + startRoom.height - 1}];

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
        if (!settings.openSpace && (Game.stage !== STAGE.DARK_TUNNEL || startRoom.type === ROOM_TYPE.BOSS || endRoom.type === ROOM_TYPE.BOSS)) {
            if (primary === "y") {
                level[bestPoint][adjacencyPlane[0][secondary]] = LEVEL_SYMBOLS.ENTRY;
            } else {
                level[adjacencyPlane[0][secondary]][bestPoint] = LEVEL_SYMBOLS.ENTRY;
            }
        }
    }
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
            } else if (level[i][j] === LEVEL_SYMBOLS.ENTRY) {
                mapCell.tileType = TILE_TYPE.ENTRY;
                const horizontal = map[i][j - 1].tileType === TILE_TYPE.NONE;
                mapCell.tile = new DoorsTile(j, i, horizontal);
                const bossRoom = rooms.find(r => r.type === ROOM_TYPE.BOSS);
                if (bossRoom !== undefined && isInsideRoom({x: j, y: i}, bossRoom)) {
                    mapCell.tile.tint = mapCell.tile.door2.tint = 0xdd2222;
                    Game.bossExit = {x: 0, y: 0};
                    if (horizontal) {
                        Game.bossExit.y = i;
                        Game.bossExit.x = j === bossRoom.offsetX ? bossRoom.offsetX + bossRoom.width - 1 : bossRoom.offsetX;
                    } else {
                        Game.bossExit.x = j;
                        Game.bossExit.y = i === bossRoom.offsetY ? bossRoom.offsetY + bossRoom.height - 1 : bossRoom.offsetY;
                    }
                }
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
    for (const dir of get8Directions().concat({x: 0, y: 0})) {
        level[Game.startPos.y + dir.y][Game.startPos.x + dir.x].tile = null;
        level[Game.startPos.y + dir.y][Game.startPos.x + dir.x].tileType = TILE_TYPE.NONE;
    }
    if (Game.stage === STAGE.DARK_TUNNEL) {
        const dir = randomChoice(get8Directions());
        level[Game.startPos.y + dir.y][Game.startPos.x + dir.x].item = new LyingItem(Game.startPos.x + dir.x, Game.startPos.y + dir.y, new Torch());
        //doesnt look cool btw :^)
        Game.torchTile = {x: Game.startPos.x + dir.x, y: Game.startPos.y + dir.y};
    }

    //for tests
    if (false) {
        const bossRoom = rooms.find(r => r.type === ROOM_TYPE.BOSS);
        Game.startPos = {x: bossRoom.offsetX + 1, y: bossRoom.offsetY + 1};
    }
    if (false) {
        level[Game.startPos.y][Game.startPos.x + 1].entity = new Chest(Game.startPos.x + 1, Game.startPos.y, getRandomChestDrop());
    }
    if (false) {
        level[startRoom.offsetY + 2][startRoom.offsetX + 2].entity = new Roller(startRoom.offsetX + 2, startRoom.offsetY + 2);
    }
}

function setBossRoomPosition(bossRoom) {
    Game.endRoomBoundaries = [
        {x: bossRoom.offsetX, y: bossRoom.offsetY},
        {x: bossRoom.offsetX + bossRoom.width - 1, y: bossRoom.offsetY + bossRoom.height - 1}];
}

function expandLevelAndRooms(expandX, expandY) {
    for (const room of rooms) {
        room.offsetX += expandX;
        room.offsetY += expandY;
    }
    return expandLevel(level, expandX, expandY);
}

function generateInanimates() {
    const obelisksAmount = 1;
    const statuesAmount = randomInt(1, 2);
    chestsAmount = Game.stage === STAGE.DARK_TUNNEL ? 3 - statuesAmount : 4 - statuesAmount;
    placeInanimate(placeChest, chestsAmount);
    placeInanimate(placeStatue, statuesAmount);
    placeInanimate(placeObelisk, obelisksAmount);
}

function placeInanimate(placeMethod, amount) {
    const mainRooms = rooms.filter(r => r.type === ROOM_TYPE.MAIN);
    const secondaryRooms = rooms.filter(r => r.type === ROOM_TYPE.SECONDARY);
    let attempt = 0;
    for (let i = 0; i < amount; i++) {
        attempt = 0;
        while (attempt++ < 200) {
            const room = Math.random() < 0.4 ? randomChoice(mainRooms) : randomChoice(secondaryRooms);
            if (placeMethod(room)) break;
        }
    }
}

function placeChest(room) {
    return placeChestOrStatue(room, true);
}

function placeStatue(room) {
    return placeChestOrStatue(room, false);
}

function placeChestOrStatue(room, isChest) {
    let attempt = 0;
    while (attempt++ < 200) {
        const point = {
            x: randomInt(room.offsetX + 1, room.offsetX + room.width - 2),
            y: randomInt(room.offsetY + 1, room.offsetY + room.height - 3)
        };
        if (level[point.y][point.x].tileType === TILE_TYPE.NONE) {
            if (!settings.openSpace && isNearEntrance(point, room)) continue;
            let good = false;
            if (level[point.y + 1][point.x].tileType === TILE_TYPE.NONE
                && level[point.y - 1][point.x].tileType === TILE_TYPE.WALL) {
                good = true;
            } else {
                for (const dir of get8Directions()) {
                    good = true;
                    if (level[point.y + dir.y][point.x + dir.x].tileType !== TILE_TYPE.NONE) {
                        good = false;
                        break;
                    }
                }
            }
            if (good) {
                ensureInanimateSurroundings(point.x, point.y);
                if (isChest) level[point.y][point.x].entity = new Chest(point.x, point.y, getRandomChestDrop());
                else {
                    if (Game.weaponPool.length > 0) {
                        level[point.y][point.x].entity = new Statue(point.x, point.y, getRandomWeapon());
                    }
                }
                return true;
            }
        }
    }
    return false;
}

//doesnt sometimes work????????? I dunno
function ensureInanimateSurroundings(x, y) {
    if (level[y][x - 1].tileType === TILE_TYPE.NONE && level[y + 1][x - 1].tileType === TILE_TYPE.WALL) {
        level[y + 1][x - 1].tileType = TILE_TYPE.NONE;
        level[y + 1][x - 1].tile = null;
    }
    if (level[y][x + 1].tileType === TILE_TYPE.NONE && level[y + 1][x + 1].tileType === TILE_TYPE.WALL) {
        level[y + 1][x + 1].tileType = TILE_TYPE.NONE;
        level[y + 1][x + 1].tile = null;
    }
}

function placeObelisk(room) {
    let attempt = 0;
    while (attempt++ < 200) {
        const point = {
            x: randomInt(room.offsetX + 3, room.offsetX + room.width - 4),
            y: randomInt(room.offsetY + 1, room.offsetY + room.height - 4)
        };
        if (level[point.y][point.x].tileType === TILE_TYPE.NONE && level[point.y - 1][point.x].tileType === TILE_TYPE.WALL
            && level[point.y - 1][point.x - 1].tileType === TILE_TYPE.WALL && level[point.y - 1][point.x + 1].tileType === TILE_TYPE.WALL) {
            const obelisk = createObelisk(point.x, point.y);
            Game.obelisks.push(obelisk);
            if (level[point.y - 1][point.x - 2].tileType === TILE_TYPE.WALL && level[point.y - 1][point.x + 2].tileType === TILE_TYPE.WALL) {
                level[point.y][point.x - 1].entity = obelisk.grail1;
                obelisk.grail1.tilePosition.set(point.x - 1, point.y);
                level[point.y][point.x + 1].entity = obelisk.grail2;
                obelisk.grail2.tilePosition.set(point.x + 1, point.y);
                level[point.y][point.x - 2].entity = obelisk.grail3;
                obelisk.grail3.tilePosition.set(point.x - 2, point.y);
                level[point.y][point.x + 2].entity = obelisk.grail4;
                obelisk.grail4.tilePosition.set(point.x + 2, point.y);
            } else {
                level[point.y + 1][point.x - 1].entity = obelisk.grail1;
                obelisk.grail1.tilePosition.set(point.x - 1, point.y + 1);
                level[point.y + 1][point.x + 1].entity = obelisk.grail2;
                obelisk.grail2.tilePosition.set(point.x + 1, point.y + 1);
                level[point.y + 2][point.x - 1].entity = obelisk.grail3;
                obelisk.grail3.tilePosition.set(point.x - 1, point.y + 2);
                level[point.y + 2][point.x + 1].entity = obelisk.grail4;
                obelisk.grail4.tilePosition.set(point.x + 1, point.y + 2);
            }
            obelisk.placeGrails();
            const clearDirs = [{x: 0, y: 0}, {x: -1, y: 0}, {x: +1, y: 0}, {x: -1, y: +1},
                {x: +1, y: +1}, {x: 0, y: +1}];
            for (const grail of [obelisk.grail1, obelisk.grail2, obelisk.grail3, obelisk.grail4]) {
                for (const dir of clearDirs) {
                    level[grail.tilePosition.y + dir.y][grail.tilePosition.x + dir.x].tileType = TILE_TYPE.NONE;
                    level[grail.tilePosition.y + dir.y][grail.tilePosition.x + dir.x].tile = null;
                }
            }
            return true;
        }
    }
    return false;
}

//obelisk generation is pretty weak right now
function createObelisk(x, y) {
    if (Game.magicPool.length >= 4) {
        let necromancyIndex = -1;
        let alivePlayer = null;
        if (Game.player.dead) alivePlayer = Game.player2;
        else if (Game.player2.dead) alivePlayer = Game.player;
        if (alivePlayer !== null) {
            if (alivePlayer.health >= 3.5) necromancyIndex = randomInt(0, 3);
            else if (alivePlayer.health >= 2.5) necromancyIndex = randomInt(0, 2);
            else necromancyIndex = randomInt(0, 1);
        }

        const magicPool = [];
        let attempt = 0;
        for (let i = 0; i < 4; ++i) {
            if (i === necromancyIndex) {
                magicPool[i] = new Necromancy();
            } else {
                while (attempt++ < 200) {
                    const randomSpell = getRandomSpell();
                    if (!magicPool.some(magic => magic.type === randomSpell.type)) {
                        magicPool[i] = randomSpell;
                        break;
                    }
                }
                if (attempt >= 200) magicPool[i] = new Necromancy();
            }
        }
        let onDestroyMagicPool = [];
        attempt = 0;
        for (let i = 0; i < 2; ++i) {
            while (attempt++ < 200) {
                const randomSpell = getRandomSpell();
                if (!onDestroyMagicPool.some(magic => magic.type === randomSpell.type)) {
                    onDestroyMagicPool[i] = randomSpell;
                    break;
                }
            }
            if (attempt >= 200) onDestroyMagicPool[i] = new Necromancy();
        }
        level[y][x].entity = new Obelisk(x, y, magicPool, onDestroyMagicPool);
        return level[y][x].entity;
    }
}

function generateEnemies() {
    generateSpecificEnemies();
    for (const room of rooms) {
        if ([ROOM_TYPE.MAIN, ROOM_TYPE.SECONDARY].includes(room.type)) {
            let emptyTiles = 0;
            for (let i = 1; i < room.height - 2; i++) {
                for (let j = 1; j < room.width - 2; j++) {
                    if (level[i + room.offsetY][j + room.offsetX].tileType === TILE_TYPE.NONE) {
                        emptyTiles++;
                    }
                }
            }
            const randomBonus = settings.openSpace ? randomChoice([-3, -2, -1, 0]) : randomChoice([-2, -1, 0, 1]);
            const enemyAmount = Math.round(emptyTiles / 7) + randomBonus;
            let pack;
            for (let i = enemyAmount; i > 0; i--) {
                pack = randomChoice(settings.enemySets.filter(set => set.length === i));
                if (pack !== undefined) break;
            }
            if (pack === undefined) continue;
            for (const enemy of pack) {
                let attempt = 0;
                while (attempt++ < 100) {
                    const point = {
                        x: randomInt(room.offsetX + 1, room.offsetX + room.width - 2),
                        y: randomInt(room.offsetY + 1, room.offsetY + room.height - 2)
                    };
                    if (level[point.y][point.x].entity === null && level[point.y][point.x].tileType === TILE_TYPE.NONE) {
                        if (!settings.openSpace && isNearEntrance(point, room)) continue;
                        else level[point.y][point.x].entity = new enemy(point.x, point.y);
                        break;
                    }
                }
            }
        }
    }
}

function isNearEntrance(point, room, maxDistance = 3) {
    const entries = getRoomEntries(room);
    for (const entry of entries) {
        if (pointTileDistance(entry, point) <= maxDistance) {
            return true;
        }
    }
    return false;
}

function getRoomEntries(room) {
    const entries = [];
    for (let i = 0; i < room.height; i++) {
        for (let j = 0; j < room.width; j++) {
            if (i === 0 || i === room.height - 1 || j === 0 || j === room.width - 1) {
                if ([TILE_TYPE.NONE, TILE_TYPE.ENTRY].includes(level[i + room.offsetY][j + room.offsetX].tileType)) {
                    entries.push({x: room.offsetX + j, y: room.offsetY + i});
                }
            }
        }
    }
    return entries;
}

function generateSpecificEnemies() {
    if (Game.stage === STAGE.FLOODED_CAVE) {
        generateSpikyWallTraps();
    }
}

function generateSpikyWallTraps() {
    let spikyWallTrapsAmount = Math.ceil(rooms.length * 1.1);
    let attempt = 0;
    while (spikyWallTrapsAmount > 0 && attempt++ < 200 + spikyWallTrapsAmount) {
        const point = {
            x: randomInt(1, level[0].length - 2),
            y: randomInt(1, level.length - 2)
        };
        if (level[point.y][point.x].tileType === TILE_TYPE.WALL && !isInsideRoom(point, rooms.find(r => r.type === ROOM_TYPE.BOSS))
            && !isInsideRoom(point, rooms.find(r => r.type === ROOM_TYPE.START))) {
            if (anyDoorsAround(point)) continue;
            for (const dir of getCardinalDirections()) {
                if (level[point.y + dir.y][point.x + dir.x].tileType === TILE_TYPE.NONE
                    && (level[point.y + dir.y][point.x + dir.x].entity === null
                        || level[point.y + dir.y][point.x + dir.x].entity.role !== ROLE.INANIMATE)) {
                    level[point.y][point.x].entity = new SpikyWallTrap(point.x, point.y);
                    spikyWallTrapsAmount--;
                    level[point.y][point.x].tile = null;
                    break;
                }
            }
        }
    }
}

function isInsideRoom(point, room) {
    return point.x >= room.offsetX && point.x <= room.offsetX + room.width - 1
        && point.y >= room.offsetY && point.y <= room.offsetY + room.height - 1;
}

function anyDoorsAround(point) {
    for (const dir of get8Directions()) {
        if (level[point.y + dir.y][point.x + dir.x].tileType === TILE_TYPE.ENTRY) {
            return true;
        }
    }
    return false;
}

function getRoom(point) {
    for (const room of rooms) {
        if (isInsideRoom(point, room)) return room;
    }
}

function generateBoss() {
    const room = rooms.find(r => r.type === ROOM_TYPE.BOSS);
    const set = randomChoice(settings.bossSets);
    const bossPos = {
        x: room.offsetX + Math.floor(room.width / 2),
        y: room.offsetY + Math.floor(room.height / 2)
    };
    for (let i = 0; i < set.length; i++) {
        let attempt = 0;
        while (attempt++ < 300) {
            const point = i === 0 ? bossPos : { //boss is the first in the set
                x: randomInt(room.offsetX + 2, room.offsetX + room.width - 3),
                y: randomInt(room.offsetY + 2, room.offsetY + room.height - 3)
            };
            if (level[point.y][point.x].entity === null && level[point.y][point.x].tileType === TILE_TYPE.NONE) {
                if (i !== 0 && pointTileDistance(point, bossPos) < 3) continue;
                if (i !== 0 && isNearEntrance(point, room)) continue;
                else level[point.y][point.x].entity = new set[i](point.x, point.y);
                if (i === 0 && level[point.y][point.x].entity.applyRoomLayout) level[point.y][point.x].entity.applyRoomLayout(level, room);
                break;
            }
        }
    }
}

function outlineLevelWithWalls() {
    for (let i = 0; i < level.length; i++) {
        for (let j = 0; j < level[0].length; j++) {
            if (i === 0 || i === level.length - 1 || j === 0 || j === level[0].length - 1) {
                level[i][j] = LEVEL_SYMBOLS.WALL;
            }
        }
    }
}

function generateKeys() {
    const keysAmount = Math.ceil(chestsAmount * 2.5);
    keysOnEnemies = Math.ceil(keysAmount / 3);
    let keysOnMap = keysAmount - keysOnEnemies;
    let attempt = 0;
    while (keysOnMap > 0 && attempt++ < 300 + keysOnMap) {
        const point = {
            x: randomInt(2, level[0].length - 3),
            y: randomInt(2, level.length - 3)
        };
        const room = getRoom(point);
        if (level[point.y][point.x].tileType === TILE_TYPE.NONE
            && level[point.y][point.x].entity === null
            && !isNearEntrance(point, room)
            && (room.type === ROOM_TYPE.MAIN || room.type === ROOM_TYPE.SECONDARY)) {
            level[point.y][point.x].item = new LyingItem(point.x, point.y, new Key());
            keysOnMap--;
        }
    }
}