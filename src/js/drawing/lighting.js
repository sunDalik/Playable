import {Game} from "../game";
import {EQUIPMENT_TYPE, STAGE, TILE_TYPE, TOOL_TYPE} from "../enums";
import {getCardinalDirections} from "../utils/map_utils";

let litAreas = [];
let torchedAreas = [];

export function lightPosition(pos, distance = 3, bright = false) {
    litAreas = [];
    if (Game.stage === STAGE.DARK_TUNNEL && bright) {
        lightWorldDT(pos.x, pos.y, distance);
    } else {
        lightWorld(pos.x, pos.y, undefined, distance);
    }
}

export function lightPlayerPosition(player) {
    litAreas = [];
    const px = player.tilePosition.x;
    const py = player.tilePosition.y;

    if (Game.stage === STAGE.DARK_TUNNEL) {
        if (player.secondHand && player.secondHand.equipmentType === EQUIPMENT_TYPE.TOOL && player.secondHand.type === TOOL_TYPE.TORCH) {
            for (const lightSource of torchedAreas) {
                Game.darkTiles[lightSource.y][lightSource.x].removeLightSource(torchLightSprite);
            }
            lightWorldDT(px, py, player.secondHand.lightSpread);
        } else {
            if (!player.carried) lightWorld(px, py, undefined, 1);
        }
    } else {
        if (player.carried) return;
        const pathDist = 5;
        const roomDist = 9;
        if (Game.map[py][px].tileType === TILE_TYPE.PATH) {
            lightWorld(px, py, true, pathDist);
        } else if (Game.map[py][px].tileType === TILE_TYPE.NONE) {
            lightWorld(px, py, false, roomDist);
        } else if (Game.map[py][px].tileType === TILE_TYPE.ENTRY) {
            let found = false;
            for (const dir of getCardinalDirections()) {
                if (Game.map[py + dir.y][px + dir.x].tileType === TILE_TYPE.NONE && !Game.map[py + dir.y][px + dir.x].lit) {
                    found = true;
                    lightWorld(px, py, false, roomDist);
                    break;
                }
            }
            if (!found) {
                lightWorld(px, py, true, pathDist);
            }
        }
    }
}

//lightPaths == true -> light paths until we encounter none else light nones until we encounter path
//lightPaths == undefined -> light anything but walls
function lightWorld(tileX, tileY, lightPaths, distance, sourceDirX = 0, sourceDirY = 0, sourceTileType = undefined) {
    const tileType = Game.map[tileY][tileX].tileType;
    if (distance > -1) {
        if ((tileType === TILE_TYPE.ENTRY && lightPaths === undefined)
            || (tileType === TILE_TYPE.PATH && (lightPaths === true || lightPaths === undefined || sourceTileType !== TILE_TYPE.ENTRY))
            || (tileType === TILE_TYPE.NONE && (lightPaths === undefined || sourceTileType !== TILE_TYPE.ENTRY))
            || tileType === TILE_TYPE.EXIT) {
            if (!Game.map[tileY][tileX].lit) lightTile(tileX, tileY);
            litAreas.push({x: tileX, y: tileY});
            if (sourceDirX === 0 && sourceDirY === 0) {
                lightWorld(tileX + 1, tileY, lightPaths, distance - 1, -1, 0, tileType);
                lightWorld(tileX - 1, tileY, lightPaths, distance - 1, 1, 0, tileType);
                lightWorld(tileX, tileY + 1, lightPaths, distance - 1, 0, -1, tileType);
                lightWorld(tileX, tileY - 1, lightPaths, distance - 1, 0, 1, tileType);
            } else {
                if (sourceDirY === 0) {
                    if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY - 1)) lightWorld(tileX, tileY - 1, lightPaths, distance - 1, sourceDirX, 1, tileType);
                    if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY + 1)) lightWorld(tileX, tileY + 1, lightPaths, distance - 1, sourceDirX, -1, tileType);
                }
                if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY - sourceDirY)) lightWorld(tileX, tileY - sourceDirY, lightPaths, distance - 1, sourceDirX, sourceDirY, tileType);
                if (sourceDirX === 0) {
                    if (!litAreas.some(tile => tile.x === tileX - 1 && tile.y === tileY)) lightWorld(tileX - 1, tileY, lightPaths, distance - 1, 1, sourceDirY, tileType);
                    if (!litAreas.some(tile => tile.x === tileX + 1 && tile.y === tileY)) lightWorld(tileX + 1, tileY, lightPaths, distance - 1, -1, sourceDirY, tileType);
                }
                if (!litAreas.some(tile => tile.x === tileX - sourceDirX && tile.y === tileY)) lightWorld(tileX - sourceDirX, tileY, lightPaths, distance - 1, sourceDirX, sourceDirY, tileType);
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
        } else if (tileType === TILE_TYPE.WALL || tileType === TILE_TYPE.SUPER_WALL) {
            if (!Game.map[tileY][tileX].lit) lightTile(tileX, tileY);
        } else if (tileType === TILE_TYPE.ENTRY) {
            if (!Game.map[tileY][tileX].lit) lightTile(tileX, tileY);
            if (sourceTileType === undefined) {
                if (lightPaths === true) {
                    for (const dir of getCardinalDirections()) {
                        if (Game.map[tileY + dir.y][tileX + dir.x].tileType === TILE_TYPE.PATH && !Game.map[tileY + dir.y][tileX + dir.x].lit) {
                            lightWorld(tileX + dir.x, tileY + dir.y, true, distance - 1);
                            break;
                        }
                    }
                } else if (lightPaths === false) {
                    for (const dir of getCardinalDirections()) {
                        if (Game.map[tileY + dir.y][tileX + dir.x].tileType === TILE_TYPE.NONE && !Game.map[tileY + dir.y][tileX + dir.x].lit) {
                            lightWorld(tileX + dir.x, tileY + dir.y, false, distance - 1);
                            break;
                        }
                    }
                }
            }
        }
    }
}

export function lightTile(tileX, tileY) {
    if (Game.stage === STAGE.DARK_TUNNEL) {
        Game.darkTiles[tileY][tileX].alpha = 0.85;
    } else {
        Game.darkTiles[tileY][tileX].visible = false;
    }
    Game.map[tileY][tileX].lit = true;

    const entity = Game.map[tileY][tileX].entity;
    if (entity) {
        if (!entity.visible && !entity.dead && entity.immediateReaction) {
            entity.immediateReaction();
        }
        entity.visible = true;
    }

    const secondaryEntity = Game.map[tileY][tileX].secondaryEntity;
    if (secondaryEntity) {
        if (!entity.visible && !entity.dead && entity.immediateReaction) {
            entity.immediateReaction();
        }
        entity.visible = true;
    }

    if (Game.map[tileY][tileX].hazard) {
        Game.map[tileY][tileX].hazard.visible = true;
    }
    if (Game.map[tileY][tileX].item) {
        Game.map[tileY][tileX].item.visible = true;
    }
}

export function darkenTile(tileX, tileY) {
    if (Game.stage === STAGE.DARK_TUNNEL) {
        Game.darkTiles[tileY][tileX].alpha = 1;
    } else {
        Game.darkTiles[tileY][tileX].visible = true;
    }
    Game.map[tileY][tileX].lit = false;
    if (Game.map[tileY][tileX].entity) {
        Game.map[tileY][tileX].entity.visible = false;
    }
    if (Game.map[tileY][tileX].secondaryEntity) {
        Game.map[tileY][tileX].secondaryEntity.visible = false;
    }
    if (Game.map[tileY][tileX].hazard) {
        Game.map[tileY][tileX].hazard.visible = false;
    }
    if (Game.map[tileY][tileX].item) {
        Game.map[tileY][tileX].item.visible = false;
    }
}

//const torchLightSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
const torchLightSprite = {};

function lightWorldDT(tileX, tileY, distance, sourceDirX = 0, sourceDirY = 0) {
    if (distance > -1) {
        if (Game.map[tileY][tileX].tileType !== TILE_TYPE.WALL && Game.map[tileY][tileX].tileType !== TILE_TYPE.SUPER_WALL) {
            lightTileDT(tileX, tileY);
            if (sourceDirX === 0 && sourceDirY === 0) {
                lightWorldDT(tileX + 1, tileY, distance - 1, -1, 0);
                lightWorldDT(tileX - 1, tileY, distance - 1, 1, 0);
                lightWorldDT(tileX, tileY + 1, distance - 1, 0, -1);
                lightWorldDT(tileX, tileY - 1, distance - 1, 0, 1);
            } else {
                if (sourceDirY === 0) {
                    if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY - 1)) lightWorldDT(tileX, tileY - 1, distance - 1, sourceDirX, 1);
                    if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY + 1)) lightWorldDT(tileX, tileY + 1, distance - 1, sourceDirX, -1);
                }
                if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY - sourceDirY)) lightWorldDT(tileX, tileY - sourceDirY, distance - 1, sourceDirX, sourceDirY);
                if (sourceDirX === 0) {
                    if (!litAreas.some(tile => tile.x === tileX - 1 && tile.y === tileY)) lightWorldDT(tileX - 1, tileY, distance - 1, 1, sourceDirY);
                    if (!litAreas.some(tile => tile.x === tileX + 1 && tile.y === tileY)) lightWorldDT(tileX + 1, tileY, distance - 1, -1, sourceDirY);
                }
                if (!litAreas.some(tile => tile.x === tileX - sourceDirX && tile.y === tileY)) lightWorldDT(tileX - sourceDirX, tileY, distance - 1, sourceDirX, sourceDirY);
            }

            //light diagonal walls
            if (Game.map[tileY + 1][tileX + 1].tileType === TILE_TYPE.WALL || Game.map[tileY + 1][tileX + 1].tileType === TILE_TYPE.SUPER_WALL) {
                if (!litAreas.some(tile => tile.x === tileX + 1 && tile.y === tileY + 1)) lightWorldDT(tileX + 1, tileY + 1, distance - 2);
            }
            if (Game.map[tileY - 1][tileX - 1].tileType === TILE_TYPE.WALL || Game.map[tileY - 1][tileX - 1].tileType === TILE_TYPE.SUPER_WALL) {
                if (!litAreas.some(tile => tile.x === tileX - 1 && tile.y === tileY - 1)) lightWorldDT(tileX - 1, tileY - 1, distance - 2);
            }
            if (Game.map[tileY + 1][tileX - 1].tileType === TILE_TYPE.WALL || Game.map[tileY + 1][tileX - 1].tileType === TILE_TYPE.SUPER_WALL) {
                if (!litAreas.some(tile => tile.x === tileX - 1 && tile.y === tileY + 1)) lightWorldDT(tileX - 1, tileY + 1, distance - 2);
            }
            if (Game.map[tileY - 1][tileX + 1].tileType === TILE_TYPE.WALL || Game.map[tileY - 1][tileX + 1].tileType === TILE_TYPE.SUPER_WALL) {
                if (!litAreas.some(tile => tile.x === tileX + 1 && tile.y === tileY - 1)) lightWorldDT(tileX + 1, tileY - 1, distance - 2);
            }
        } else lightTileDT(tileX, tileY);
    } else if (distance === -1) {
        if (!Game.map[tileY][tileX].lit) lightTile(tileX, tileY);
    }
}

function lightTileDT(tileX, tileY) {
    if (!Game.map[tileY][tileX].lit) lightTile(tileX, tileY);
    litAreas.push({x: tileX, y: tileY});
    torchedAreas.push({x: tileX, y: tileY});
    Game.darkTiles[tileY][tileX].addLightSource(torchLightSprite);
}