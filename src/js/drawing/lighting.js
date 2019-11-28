import {Game} from "../game";
import {STAGE, TILE_TYPE} from "../enums";

let litAreas = [];
let litDTAreas = [];

export function lightPlayerPosition(player) {
    litAreas = [];
    const px = player.tilePosition.x;
    const py = player.tilePosition.y;

    if (Game.stage === STAGE.DARK_TUNNEL) {
        const torchDist = 2;
        const duskDist = 3;
        lightWorld(px, py, undefined, duskDist);

        //later you will change that if so it checks if player has torch
        if (Game.stage === STAGE.DARK_TUNNEL && player === Game.player) {
            for (const tile of litDTAreas) {
                Game.semiDarkTiles[tile.y][tile.x].visible = true;
            }
            litDTAreas = [];
            lightWorldDTTorch(px, py, torchDist);
        }
    } else {
        const pathDist = 5;
        const roomDist = 9;
        if (Game.map[py][px].tileType === TILE_TYPE.PATH) {
            lightWorld(px, py, true, pathDist);
        } else if (Game.map[py][px].tileType === TILE_TYPE.NONE) {
            lightWorld(px, py, false, roomDist);
        } else if (Game.map[py][px].tileType === TILE_TYPE.ENTRY) {
            if ((Game.map[py + 1][px].tileType === TILE_TYPE.PATH && !Game.map[py + 1][px].lit)
                || (Game.map[py - 1][px].tileType === TILE_TYPE.PATH && !Game.map[py - 1][px].lit)
                || (Game.map[py][px + 1].tileType === TILE_TYPE.PATH && !Game.map[py][px + 1].lit)
                || (Game.map[py][px - 1].tileType === TILE_TYPE.PATH && !Game.map[py][px - 1].lit)) {
                lightWorld(px, py, true, pathDist);
            } else {
                lightWorld(px, py, false, roomDist);
            }
        }
    }
}

//lightPaths == true -> light paths until we encounter none else light nones until we encounter path
//lightPaths == undefined -> light anything but walls
function lightWorld(tileX, tileY, lightPaths, distance = 8, sourceDirX = 0, sourceDirY = 0) {
    if (distance > -1) {
        if (Game.map[tileY][tileX].tileType === TILE_TYPE.ENTRY
            || (Game.map[tileY][tileX].tileType === TILE_TYPE.PATH && (lightPaths === true || lightPaths === undefined))
            || ((Game.map[tileY][tileX].tileType === TILE_TYPE.NONE && (lightPaths === false || lightPaths === undefined))
                || Game.map[tileY][tileX].tileType === TILE_TYPE.EXIT)) {
            if (!Game.map[tileY][tileX].lit) {
                lightTile();
            }

            litAreas.push({x: tileX, y: tileY});
            if (sourceDirX === 0 && sourceDirY === 0) {
                lightWorld(tileX + 1, tileY, lightPaths, distance - 1, -1, 0);
                lightWorld(tileX - 1, tileY, lightPaths, distance - 1, 1, 0);
                lightWorld(tileX, tileY + 1, lightPaths, distance - 1, 0, -1);
                lightWorld(tileX, tileY - 1, lightPaths, distance - 1, 0, 1);
            } else {
                if (sourceDirY === 0) {
                    if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY - 1)) lightWorld(tileX, tileY - 1, lightPaths, distance - 1, sourceDirX, 1);
                    if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY + 1)) lightWorld(tileX, tileY + 1, lightPaths, distance - 1, sourceDirX, -1);
                }
                if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY - sourceDirY)) lightWorld(tileX, tileY - sourceDirY, lightPaths, distance - 1, sourceDirX, sourceDirY);
                if (sourceDirX === 0) {
                    if (!litAreas.some(tile => tile.x === tileX - 1 && tile.y === tileY)) lightWorld(tileX - 1, tileY, lightPaths, distance - 1, 1, sourceDirY);
                    if (!litAreas.some(tile => tile.x === tileX + 1 && tile.y === tileY)) lightWorld(tileX + 1, tileY, lightPaths, distance - 1, -1, sourceDirY);
                }
                if (!litAreas.some(tile => tile.x === tileX - sourceDirX && tile.y === tileY)) lightWorld(tileX - sourceDirX, tileY, lightPaths, distance - 1, sourceDirX, sourceDirY);
            }

            //light diagonal walls
            if (!Game.map[tileY + 1][tileX + 1].lit && (Game.map[tileY + 1][tileX + 1].tileType === TILE_TYPE.WALL || Game.map[tileY + 1][tileX + 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX + 1, tileY + 1, lightPaths, distance - 1);
            }
            if (!Game.map[tileY - 1][tileX - 1].lit && (Game.map[tileY - 1][tileX - 1].tileType === TILE_TYPE.WALL || Game.map[tileY - 1][tileX - 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX - 1, tileY - 1, lightPaths, distance - 1);
            }
            if (!Game.map[tileY + 1][tileX - 1].lit && (Game.map[tileY + 1][tileX - 1].tileType === TILE_TYPE.WALL || Game.map[tileY + 1][tileX - 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX - 1, tileY + 1, lightPaths, distance - 1);
            }
            if (!Game.map[tileY - 1][tileX + 1].lit && (Game.map[tileY - 1][tileX + 1].tileType === TILE_TYPE.WALL || Game.map[tileY - 1][tileX + 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX + 1, tileY - 1, lightPaths, distance - 1);
            }

        } else if (Game.map[tileY][tileX].tileType === TILE_TYPE.WALL || Game.map[tileY][tileX].tileType === TILE_TYPE.SUPER_WALL) {
            if (!Game.map[tileY][tileX].lit) {
                lightTile();
            }
        }
    }

    function lightTile() {
        Game.darkTiles[tileY][tileX].visible = false;
        Game.map[tileY][tileX].lit = true;
        if (Game.map[tileY][tileX].entity) {
            Game.map[tileY][tileX].entity.visible = true;
        }
        if (Game.map[tileY][tileX].secondaryEntity) {
            Game.map[tileY][tileX].secondaryEntity.visible = true;
        }
        if (Game.map[tileY][tileX].hazard) {
            Game.map[tileY][tileX].hazard.visible = true;
        }
        if (Game.map[tileY][tileX].item) {
            Game.map[tileY][tileX].item.visible = true;
        }
    }
}

function lightWorldDTTorch(tileX, tileY, distance = 2, sourceDirX = 0, sourceDirY = 0) {
    if (distance > -1) {
        if (Game.map[tileY][tileX].lit && Game.map[tileY][tileX].tileType !== TILE_TYPE.WALL
            && Game.map[tileY][tileX].tileType !== TILE_TYPE.SUPER_WALL) {
            Game.semiDarkTiles[tileY][tileX].visible = false;
            litDTAreas.push({x: tileX, y: tileY});
            if (sourceDirX === 0 && sourceDirY === 0) {
                lightWorldDTTorch(tileX + 1, tileY, distance - 1, -1, 0);
                lightWorldDTTorch(tileX - 1, tileY, distance - 1, 1, 0);
                lightWorldDTTorch(tileX, tileY + 1, distance - 1, 0, -1);
                lightWorldDTTorch(tileX, tileY - 1, distance - 1, 0, 1);
            } else {
                if (sourceDirY === 0) {
                    if (!litDTAreas.some(tile => tile.x === tileX && tile.y === tileY - 1)) lightWorldDTTorch(tileX, tileY - 1, distance - 1, sourceDirX, 1);
                    if (!litDTAreas.some(tile => tile.x === tileX && tile.y === tileY + 1)) lightWorldDTTorch(tileX, tileY + 1, distance - 1, sourceDirX, -1);
                }
                if (!litDTAreas.some(tile => tile.x === tileX && tile.y === tileY - sourceDirY)) lightWorldDTTorch(tileX, tileY - sourceDirY, distance - 1, sourceDirX, sourceDirY);
                if (sourceDirX === 0) {
                    if (!litDTAreas.some(tile => tile.x === tileX - 1 && tile.y === tileY)) lightWorldDTTorch(tileX - 1, tileY, distance - 1, 1, sourceDirY);
                    if (!litDTAreas.some(tile => tile.x === tileX + 1 && tile.y === tileY)) lightWorldDTTorch(tileX + 1, tileY, distance - 1, -1, sourceDirY);
                }
                if (!litDTAreas.some(tile => tile.x === tileX - sourceDirX && tile.y === tileY)) lightWorldDTTorch(tileX - sourceDirX, tileY, distance - 1, sourceDirX, sourceDirY);
            }

            //light diagonal walls
            if (Game.map[tileY + 1][tileX + 1].tileType === TILE_TYPE.WALL || Game.map[tileY + 1][tileX + 1].tileType === TILE_TYPE.SUPER_WALL) {
                lightWorldDTTorch(tileX + 1, tileY + 1, distance - 2);
            }
            if (Game.map[tileY - 1][tileX - 1].tileType === TILE_TYPE.WALL || Game.map[tileY - 1][tileX - 1].tileType === TILE_TYPE.SUPER_WALL) {
                lightWorldDTTorch(tileX - 1, tileY - 1, distance - 2);
            }
            if (Game.map[tileY + 1][tileX - 1].tileType === TILE_TYPE.WALL || Game.map[tileY + 1][tileX - 1].tileType === TILE_TYPE.SUPER_WALL) {
                lightWorldDTTorch(tileX - 1, tileY + 1, distance - 2);
            }
            if (Game.map[tileY - 1][tileX + 1].tileType === TILE_TYPE.WALL || Game.map[tileY - 1][tileX + 1].tileType === TILE_TYPE.SUPER_WALL) {
                lightWorldDTTorch(tileX + 1, tileY - 1, distance - 2);
            }
        } else {
            Game.semiDarkTiles[tileY][tileX].visible = false;
            litDTAreas.push({x: tileX, y: tileY});
        }
    }
}