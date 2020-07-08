import {randomChoice, randomInt, randomShuffle} from "../utils/random_utils";
import {init2dArray, removeObjectFromArray} from "../utils/basic_utils";
import {INANIMATE_TYPE, LEVEL_SYMBOLS, PLANE, ROLE, STAGE, TILE_TYPE} from "../enums";
import {Game} from "../game";
import {expandLevel} from "./generation_utils";
import {comboShapers, shapers} from "./room_shapers";
import {WallTile} from "../classes/draw/wall";
import {SuperWallTile} from "../classes/draw/super_wall";
import {Room, ROOM_TYPE} from "./room";
import {Chest} from "../classes/inanimate_objects/chest";
import {get8Directions, getCardinalDirections, getHorizontalDirections} from "../utils/map_utils";
import {Obelisk} from "../classes/inanimate_objects/obelisk";
import {pointTileDistance} from "../utils/game_utils";
import {SpikyWallTrap} from "../classes/enemies/fc/spiky_wall_trap";
import {DoorsTile} from "../classes/draw/doors";
import {LyingItem} from "../classes/equipment/lying_item";
import {Torch} from "../classes/equipment/tools/torch";
import {Key} from "../classes/equipment/key";
import {KingFireFrog} from "../classes/enemies/dt/frog_king_fire";
import {LaserTurret} from "../classes/enemies/dt/laser_turret";
import {Boss} from "../classes/enemies/bosses/boss";
import {Shopkeeper} from "../classes/npc/shopkeeper";
import {ShopStand} from "../classes/inanimate_objects/shop_stand";
import {Bomb} from "../classes/equipment/bag/bomb";
import {HealingPotion} from "../classes/equipment/bag/healing_potion";
import {getRandomShopItem} from "../utils/pool_utils";

let settings;
let level;
let rooms = [];

//these are set later
let chestsAmount = 0;
export let keysOnEnemies = 0;

//you HAVE to setup settings before you use generator
export function setupGenerator(generatorSettings) {
    settings = generatorSettings;
}

export function generateStandard() {
    rooms = [];
    level = initEmptyLevel();
    const bossSet = randomChoice(settings.bossSets);
    const bossRoomStats = bossSet[0].getBossRoomStats ? bossSet[0].getBossRoomStats() : Boss.getBossRoomStats();
    const sectors = createBossRoom(bossRoomStats);
    let bossRoom;
    for (const sector of sectors) {
        if (sector.type === ROOM_TYPE.BOSS) {
            bossRoom = sector;
            rooms.push(sector);
        } else {
            rooms = rooms.concat(splitRoomAMAP(sector));
        }
    }
    for (const room of rooms) {
        if (!settings.openSpace) outlineRoomWithWalls(room);
        if (Math.random() > 0.4) shapeRoom(room, randomChoice(comboShapers));
        else shapeRoom(room, randomChoice(shapers));
        //shapeRoom(room, shapers[5]); //for testing
        //shapeRoom(room, randomChoice(shapers)); //for testing
        randomlyRotateRoom(room);
    }
    if (settings.openSpace) {
        outlineLevelWithWalls();
        outlineRoomWithWalls(bossRoom, true);
    }
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
    const secretRoomsAmount = Game.stage === STAGE.FLOODED_CAVE ? 1 : 0;
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
    outlineLevelWithWalls(true);

    //level shaping is finished
    level = replaceStringsWithObjects();
    for (const secretRoom of unconnectedRooms) {
        createSecrets(secretRoom);
    }
    generateInanimates();
    generateEnemies();
    generateBoss(bossSet);
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

function createBossRoom(bossRoomStats) {
    let xs = [0, level[0].length - bossRoomStats.width];
    for (let i = settings.minRoomSize; i <= level[0].length - 1 - settings.minRoomSize - bossRoomStats.width; i++) {
        xs.push(i);
    }
    let ys = [0, level.length - bossRoomStats.height];
    for (let i = settings.minRoomSize; i <= level.length - 1 - settings.minRoomSize - bossRoomStats.height; i++) {
        ys.push(i);
    }
    const x = randomChoice(xs);
    const y = randomChoice(ys);
    let sectors = [new Room(x, y, bossRoomStats.width, bossRoomStats.height, ROOM_TYPE.BOSS)];
    if (x !== 0 && y !== 0) sectors.push(new Room(0, 0, x, y));
    if (y !== 0) sectors.push(new Room(x, 0, bossRoomStats.width, y));
    if (y !== 0 && x !== level[0].length - bossRoomStats.width) sectors.push(new Room(x + bossRoomStats.width, 0, level[0].length - x - bossRoomStats.width, y));
    if (x !== 0) sectors.push(new Room(0, y, x, bossRoomStats.height));
    if (x !== level[0].length - bossRoomStats.width) sectors.push(new Room(x + bossRoomStats.width, y, level[0].length - x - bossRoomStats.width, bossRoomStats.height));
    if (x !== 0 && y !== level.length - bossRoomStats.height) sectors.push(new Room(0, y + bossRoomStats.height, x, level.length - y - bossRoomStats.height));
    if (y !== level.length - bossRoomStats.height) sectors.push(new Room(x, y + bossRoomStats.height, bossRoomStats.width, level.length - y - bossRoomStats.height));
    if (y !== level.length - bossRoomStats.height && x !== level[0].length - bossRoomStats.width) sectors.push(new Room(x + bossRoomStats.width, y + bossRoomStats.height, level[0].length - x - bossRoomStats.width, level.length - y - bossRoomStats.height));
    return sectors;
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

function outlineRoomWithWalls(room, superWalls = false) {
    const symbol = superWalls ? LEVEL_SYMBOLS.SUPER_WALL : LEVEL_SYMBOLS.WALL;
    for (let i = 0; i < room.height; i++) {
        for (let j = 0; j < room.width; j++) {
            if (i === 0 || j === 0 || i === room.height - 1 || j === room.width - 1) {
                level[i + room.offsetY][j + room.offsetX] = symbol;
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

function planPath(startRoom) {
    const maxPath = rooms.length * 0.6;
    let path = [startRoom];
    let attempt = 0;
    while (path.length < maxPath) {
        const nextRoom = randomChoice(getAdjacentRooms(path[path.length - 1]).filter(r => !path.includes(r)));
        if (nextRoom === undefined) {
            if (attempt++ > 200 || path.length > 4) break;
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
        if ((!settings.openSpace && Game.stage !== STAGE.DARK_TUNNEL) || (startRoom.type === ROOM_TYPE.BOSS || endRoom.type === ROOM_TYPE.BOSS)) {
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
        clearWall(Game.startPos.x + dir.x, Game.startPos.y + dir.y);
    }
    if (Game.stage === STAGE.DARK_TUNNEL) {
        const dir = randomChoice(get8Directions());
        level[Game.startPos.y + dir.y][Game.startPos.x + dir.x].item = new LyingItem(Game.startPos.x + dir.x, Game.startPos.y + dir.y, new Torch());
        //doesnt look cool btw :^)
        Game.torchTile = {x: Game.startPos.x + dir.x, y: Game.startPos.y + dir.y};
    }

    //for tests
    if (true) {
        const bossRoom = rooms.find(r => r.type === ROOM_TYPE.BOSS);
        Game.startPos = {x: bossRoom.offsetX + 1, y: bossRoom.offsetY + 1};
    }
    if (false) {
        level[Game.startPos.y][Game.startPos.x + 1].entity = new Chest(Game.startPos.x + 1, Game.startPos.y);
    }
    if (false) {
        //level[startRoom.offsetY + 2][startRoom.offsetX + 2].entity = new KingFrog(startRoom.offsetX + 2, startRoom.offsetY + 2);
        level[startRoom.offsetY + startRoom.height - 3][startRoom.offsetX + startRoom.width - 3].entity = new KingFireFrog(startRoom.offsetX + startRoom.width - 3, startRoom.offsetY + startRoom.height - 3);
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
    const shopAmount = 1;
    chestsAmount = Game.stage === STAGE.DARK_TUNNEL ? 2 : 3;
    placeInanimate(placeObelisk, obelisksAmount);
    placeInanimate(placeShop, shopAmount);
    placeInanimate(placeChest, chestsAmount);
}

function placeInanimate(placeMethod, amount) {
    for (let i = 0; i < amount; i++) {
        //we separate rooms into main rooms and secondary rooms because we are biased towards secondary rooms here
        const mainRooms = rooms.filter(r => r.type === ROOM_TYPE.MAIN);
        const secondaryRooms = rooms.filter(r => r.type === ROOM_TYPE.SECONDARY);
        while (mainRooms.length > 0 || secondaryRooms.length > 0) {
            let room;
            if (mainRooms.length === 0) room = randomChoice(secondaryRooms);
            else if (secondaryRooms.length === 0) room = randomChoice(mainRooms);
            else room = Math.random() < 0.4 ? randomChoice(mainRooms) : randomChoice(secondaryRooms);
            if (placeInARoom(placeMethod, room)) break;
            removeObjectFromArray(room, mainRooms);
            removeObjectFromArray(room, secondaryRooms);
        }
    }
}

function placeInARoom(placeMethod, room) {
    for (const point of getValidRoomPoints(room)) {
        if (placeMethod(point, room)) return true;
    }
    return false;
}

function getValidRoomPoints(room) {
    const points = [];
    for (let i = 1; i < room.height - 1; i++) {
        for (let j = 1; j < room.width - 1; j++) {
            points.push({x: j + room.offsetX, y: i + room.offsetY});
        }
    }
    return randomShuffle(points);
}

function placeChest(point, room) {
    if (point.y > room.offsetY + room.height - 3) return false;
    if (level[point.y][point.x].entity === null && level[point.y][point.x].tileType === TILE_TYPE.NONE) {
        //not near a door
        if (isNearEntrance(point, room)) return false;
        //no inanimates on 8 tiles nearby
        for (const dir of get8Directions()) {
            if (level[point.y + dir.y][point.x + dir.x].entity && level[point.y + dir.y][point.x + dir.x].entity.role === ROLE.INANIMATE) {
                return false;
            }
        }
        //the chest either stands with a wall behind it or in a completely open area
        if (!(level[point.y + 1][point.x].tileType === TILE_TYPE.NONE
            && level[point.y - 1][point.x].tileType === TILE_TYPE.WALL)) {
            for (const dir of get8Directions()) {
                if (level[point.y + dir.y][point.x + dir.x].tileType !== TILE_TYPE.NONE) {
                    return false;
                }
            }
        }

        ensureInanimateSurroundings(point.x, point.y);
        level[point.y][point.x].entity = new Chest(point.x, point.y);
        return true;
    }
    return false;
}

function ensureInanimateSurroundings(x, y) {
    if (level[y][x - 1].tileType === TILE_TYPE.NONE && level[y + 1][x - 1].tileType === TILE_TYPE.WALL) {
        clearWall(x - 1, y + 1);
    }
    if (level[y][x + 1].tileType === TILE_TYPE.NONE && level[y + 1][x + 1].tileType === TILE_TYPE.WALL) {
        clearWall(x + 1, y + 1);
    }
}

function placeShop(point, room) {
    if (point.x < room.offsetX + 3 || point.x > room.offsetX + room.width - 4 || point.y > room.offsetY + room.height - 5) return false;

    //check that all 5 tiles behind us are walls
    for (let j = point.x - 2; j <= point.x + 2; j++) {
        if (level[point.y - 1][j].tileType !== TILE_TYPE.WALL) return false;
    }

    //minimal check for emptiness
    if (level[point.y][point.x].tileType !== TILE_TYPE.NONE) return false;

    //check that not near doors
    if (isNearEntrance({x: point.x, y: point.y}, room, 4)) return false;

    // check that no entity is even near the shop. Usually at this point of generation only entities you can encounter are obelisks
    for (let i = point.y - 1; i <= point.y + 2; i++) {
        for (let j = point.x - 3; j <= point.x + 3; j++) {
            if (level[i][j].entity !== null) return false;
        }
    }


    const clearPathToTile = (x, y, dirX) => {
        if ([TILE_TYPE.ENTRY, TILE_TYPE.NONE].includes(level[y][x + dirX].tileType)) clearWall(x + dirX, y + 1);
    };


    //clear surroundings
    for (let i = point.y; i <= point.y + 2; i++) {
        for (let j = point.x - 2; j <= point.x + 2; j++) {
            clearWall(j, i);
        }
    }
    clearPathToTile(point.x - 2, point.y, -1);
    clearPathToTile(point.x + 2, point.y, 1);

    level[point.y][point.x].entity = new Shopkeeper(point.x, point.y);
    level[point.y][point.x - 2].entity = new ShopStand(point.x - 2, point.y, new Bomb());
    level[point.y][point.x + 2].entity = new ShopStand(point.x + 2, point.y, new HealingPotion());
    level[point.y + 1][point.x].entity = new ShopStand(point.x, point.y + 1, getRandomShopItem());
    level[point.y + 1][point.x + 1].entity = new ShopStand(point.x + 1, point.y + 1, getRandomShopItem());
    level[point.y + 1][point.x - 1].entity = new ShopStand(point.x - 1, point.y + 1, getRandomShopItem());
    return true;
}

function placeObelisk(point, room) {
    if (point.x < room.offsetX + 3 || point.x > room.offsetX + room.width - 4 || point.y > room.offsetY + room.height - 5) return false;
    if (isNearEntrance(point, room)) return false;
    if (level[point.y][point.x].entity === null && level[point.y][point.x].tileType === TILE_TYPE.NONE && level[point.y - 1][point.x].tileType === TILE_TYPE.WALL
        && level[point.y - 1][point.x - 1].tileType === TILE_TYPE.WALL && level[point.y - 1][point.x + 1].tileType === TILE_TYPE.WALL) {
        level[point.y][point.x].entity = new Obelisk(point.x, point.y, level);
        return true;
    }
    return false;
}

function generateEnemies() {
    generateSpecificEnemies();
    for (const room of rooms) {
        if ([ROOM_TYPE.MAIN, ROOM_TYPE.SECONDARY].includes(room.type)) {
            let emptyTiles = 0;
            for (let i = 1; i < room.height - 2; i++) {
                for (let j = 1; j < room.width - 2; j++) {
                    if (level[i + room.offsetY][j + room.offsetX].tileType === TILE_TYPE.NONE
                        && level[i + room.offsetY][j + room.offsetX].entity === null) {
                        emptyTiles++;
                    }
                }
            }
            let randomBonus = randomChoice([-2, -1, 0, 1]);
            if (settings.openSpace) randomBonus = randomChoice([-3, -2, -1, 0]);
            else if (Game.stage === STAGE.DARK_TUNNEL) randomBonus = randomChoice([-2, -1, 0]);
            let enemyAmount = Math.round(emptyTiles / 7) + randomBonus;
            if (enemyAmount <= 0 && Math.random() < 0.8) enemyAmount = 1;
            let pack;
            for (let i = enemyAmount; i > 0; i--) {
                pack = randomChoice(settings.enemySets.filter(set => set.length === i));
                if (pack !== undefined) break;
            }
            if (pack === undefined) continue;
            const points = getValidRoomPoints(room);
            for (const enemy of pack) {
                for (let i = points.length - 1; i >= 0; i--) {
                    const point = points[i];
                    removeObjectFromArray(point, points);

                    if (level[point.y][point.x].entity === null && level[point.y][point.x].tileType === TILE_TYPE.NONE) {
                        if (nearShopkeeper(point)) continue;
                        if (isNearEntrance(point, room)) continue;
                        level[point.y][point.x].entity = new enemy(point.x, point.y);
                        break;
                    }
                }
            }
        }
    }
}

function nearShopkeeper(point) {
    for (const dir of getCardinalDirections()) {
        const entity = level[point.y + dir.y][point.x + dir.x].entity;
        if (entity && entity.role === ROLE.INANIMATE && entity.type === INANIMATE_TYPE.SHOPKEEPER) return true;
    }
    return false;
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
    const entranceTiles = settings.openSpace ? [TILE_TYPE.ENTRY] : [TILE_TYPE.NONE, TILE_TYPE.ENTRY];
    for (let i = 0; i < room.height; i++) {
        for (let j = 0; j < room.width; j++) {
            if (i === 0 || i === room.height - 1 || j === 0 || j === room.width - 1) {
                if (entranceTiles.includes(level[i + room.offsetY][j + room.offsetX].tileType)) {
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
    } else if (Game.stage === STAGE.DARK_TUNNEL) {
        generateLaserTurrets();
    }
}

function generateSpikyWallTraps() {
    let spikyWallTrapsAmount = Math.ceil(rooms.length * 1.1);
    for (const point of getValidRoomPoints(new Room(0, 0, level[0].length, level.length))) {
        if (spikyWallTrapsAmount <= 0) break;
        if (level[point.y][point.x].tileType === TILE_TYPE.WALL && !isInsideRoom(point, rooms.find(r => r.type === ROOM_TYPE.BOSS))
            && !isInsideRoom(point, rooms.find(r => r.type === ROOM_TYPE.START))) {
            if (anyDoorsAround(point)) continue;
            for (const dir of randomShuffle(getCardinalDirections())) {
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

function generateLaserTurrets() {
    let laserTurretsAmount = Math.ceil(rooms.length);
    for (const point of getValidRoomPoints(new Room(0, 0, level[0].length, level.length))) {
        if (laserTurretsAmount <= 0) break;
        if (level[point.y][point.x].tileType === TILE_TYPE.WALL && !isInsideRoom(point, rooms.find(r => r.type === ROOM_TYPE.BOSS))
            && !isInsideRoom(point, rooms.find(r => r.type === ROOM_TYPE.START))
            && level[point.y + 1][point.x].tileType === TILE_TYPE.NONE) {
            for (const dir of randomShuffle(getHorizontalDirections())) {
                if (level[point.y][point.x + dir.x].entity === null
                    || level[point.y][point.x + dir.x].entity.role !== ROLE.INANIMATE) {
                    const maxRange = 6;
                    const minRange = 2;
                    let bad = false;
                    for (let x = dir.x; ; x += dir.x) {
                        if (level[point.y][point.x + x].tileType === TILE_TYPE.ENTRY) {
                            bad = true;
                            break;
                        }
                        if (level[point.y][point.x + x].tileType === TILE_TYPE.WALL || level[point.y][point.x + x].tileType === TILE_TYPE.SUPER_WALL) {
                            const range = Math.abs(x) - 1;
                            if (range < minRange || range > maxRange) bad = true;
                            break;
                        }
                    }
                    if (bad) continue;
                    level[point.y][point.x].entity = new LaserTurret(point.x, point.y, dir.x);
                    laserTurretsAmount--;
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

function generateBoss(set) {
    const room = rooms.find(r => r.type === ROOM_TYPE.BOSS);
    const bossPos = {
        x: room.offsetX + Math.floor(room.width / 2),
        y: room.offsetY + Math.floor(room.height / 2)
    };

    const points = getValidRoomPoints(room);
    for (let e = 0; e < set.length; e++) {
        for (let i = points.length - 1; i >= 0; i--) {
            let point;
            if (e === 0) {
                point = bossPos;
            } else {
                point = points[i];
                removeObjectFromArray(point, points);
            }

            if (level[point.y][point.x].entity === null && level[point.y][point.x].tileType === TILE_TYPE.NONE) {
                if (e !== 0 && pointTileDistance(point, bossPos) < 3) continue;
                if (e !== 0 && isNearEntrance(point, room)) continue;
                else level[point.y][point.x].entity = new set[e](point.x, point.y);
                if (e === 0 && level[point.y][point.x].entity.applyRoomLayout) level[point.y][point.x].entity.applyRoomLayout(level, room);
                break;
            }
        }
    }
}

function outlineLevelWithWalls(superWalls = false) {
    for (let i = 0; i < level.length; i++) {
        for (let j = 0; j < level[0].length; j++) {
            if (i === 0 || i === level.length - 1 || j === 0 || j === level[0].length - 1) {
                if (superWalls) level[i][j] = LEVEL_SYMBOLS.SUPER_WALL;
                else level[i][j] = LEVEL_SYMBOLS.WALL;
            }
        }
    }
}

function generateKeys() {
    const keysAmount = Math.ceil(chestsAmount * 2.5);
    keysOnEnemies = Math.ceil(keysAmount / 3);
    let keysOnMap = keysAmount - keysOnEnemies;

    for (const point of getValidRoomPoints(new Room(1, 1, level[0].length - 2, level.length - 2))) {
        if (keysOnMap <= 0) break;
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

function createSecrets(secretRoom) {
    if (Game.stage === STAGE.FLOODED_CAVE) {
        const point = {
            x: secretRoom.offsetX + Math.floor(secretRoom.width / 2),
            y: secretRoom.offsetY + 1
        };
        level[point.y][point.x].entity = new Obelisk(point.x, point.y, level);
    }
}

export function clearWall(x, y) {
    level[y][x].tile = null;
    level[y][x].tileType = TILE_TYPE.NONE;
}