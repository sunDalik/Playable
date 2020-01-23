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
        lightWorld(pos.x, pos.y, distance, true);
    }
}

export function extinguishTorch() {
    for (const lightSource of torchedAreas) {
        Game.darkTiles[lightSource.y][lightSource.x].removeLightSource(torchLightSprite);
    }
    torchedAreas = [];
}

export function lightPlayerPosition(player) {
    if (player.dead) return;
    litAreas = [];
    const px = player.tilePosition.x;
    const py = player.tilePosition.y;

    if (Game.stage === STAGE.DARK_TUNNEL) {
        if (player.secondHand && player.secondHand.equipmentType === EQUIPMENT_TYPE.TOOL && player.secondHand.type === TOOL_TYPE.TORCH) {
            for (const lightSource of torchedAreas) {
                Game.darkTiles[lightSource.y][lightSource.x].removeLightSource(torchLightSprite);
            }
            torchedAreas = [];
            lightWorldDT(px, py, player.secondHand.lightSpread);
        } else {
            lightWorld(px, py, 1, true);
        }
    } else if (Game.stage === STAGE.RUINS) {
        //return;
        const roomDist = 12;
        lightWorld(px, py, roomDist);
    } else {
        const pathDist = 5;
        const roomDist = 9;
        if (Game.map[py][px].tileType === TILE_TYPE.PATH) {
            lightWorld(px, py, pathDist);
        } else if (Game.map[py][px].tileType === TILE_TYPE.NONE) {
            lightWorld(px, py, roomDist);
        } else if (Game.map[py][px].tileType === TILE_TYPE.ENTRY) {
            let found = false;
            for (const dir of getCardinalDirections()) {
                if (Game.map[py + dir.y][px + dir.x].tileType === TILE_TYPE.NONE && !Game.map[py + dir.y][px + dir.x].lit) {
                    found = true;
                    lightWorld(px, py, roomDist);
                    break;
                }
            }
            if (!found) {
                lightWorld(px, py, pathDist);
            }
        }
    }
}

function lightWorld(tileX, tileY, distance, crossEntries = false, sourceDirX = 0, sourceDirY = 0, spreadStart = true) {
    const tileType = Game.map[tileY][tileX].tileType;
    if (distance > -1) {
        if ((tileType === TILE_TYPE.ENTRY && (crossEntries === true || spreadStart === true))
            || tileType === TILE_TYPE.PATH || tileType === TILE_TYPE.NONE || tileType === TILE_TYPE.EXIT) {
            if (!Game.map[tileY][tileX].lit) lightTile(tileX, tileY);
            litAreas.push({x: tileX, y: tileY});
            if (sourceDirX === 0 && sourceDirY === 0) {
                lightWorld(tileX + 1, tileY, distance - 1, crossEntries, -1, 0, false);
                lightWorld(tileX - 1, tileY, distance - 1, crossEntries, 1, 0, false);
                lightWorld(tileX, tileY + 1, distance - 1, crossEntries, 0, -1, false);
                lightWorld(tileX, tileY - 1, distance - 1, crossEntries, 0, 1, false);
            } else {
                if (sourceDirY === 0) {
                    if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY - 1)) lightWorld(tileX, tileY - 1, distance - 1, crossEntries, sourceDirX, 1, false);
                    if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY + 1)) lightWorld(tileX, tileY + 1, distance - 1, crossEntries, sourceDirX, -1, false);
                }
                if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY - sourceDirY)) lightWorld(tileX, tileY - sourceDirY, distance - 1, crossEntries, sourceDirX, sourceDirY, false);
                if (sourceDirX === 0) {
                    if (!litAreas.some(tile => tile.x === tileX - 1 && tile.y === tileY)) lightWorld(tileX - 1, tileY, distance - 1, crossEntries, 1, sourceDirY, false);
                    if (!litAreas.some(tile => tile.x === tileX + 1 && tile.y === tileY)) lightWorld(tileX + 1, tileY, distance - 1, crossEntries, -1, sourceDirY, false);
                }
                if (!litAreas.some(tile => tile.x === tileX - sourceDirX && tile.y === tileY)) lightWorld(tileX - sourceDirX, tileY, distance - 1, crossEntries, sourceDirX, sourceDirY, false);
            }

            //light diagonal walls
            if (!Game.map[tileY + 1][tileX + 1].lit && (Game.map[tileY + 1][tileX + 1].tileType === TILE_TYPE.WALL || Game.map[tileY + 1][tileX + 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX + 1, tileY + 1, distance - 1);
            }
            if (!Game.map[tileY - 1][tileX - 1].lit && (Game.map[tileY - 1][tileX - 1].tileType === TILE_TYPE.WALL || Game.map[tileY - 1][tileX - 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX - 1, tileY - 1, distance - 1);
            }
            if (!Game.map[tileY + 1][tileX - 1].lit && (Game.map[tileY + 1][tileX - 1].tileType === TILE_TYPE.WALL || Game.map[tileY + 1][tileX - 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX - 1, tileY + 1, distance - 1);
            }
            if (!Game.map[tileY - 1][tileX + 1].lit && (Game.map[tileY - 1][tileX + 1].tileType === TILE_TYPE.WALL || Game.map[tileY - 1][tileX + 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX + 1, tileY - 1, distance - 1);
            }
        } else if (tileType === TILE_TYPE.WALL || tileType === TILE_TYPE.SUPER_WALL) {
            if (!Game.map[tileY][tileX].lit) lightTile(tileX, tileY);
        } else if (tileType === TILE_TYPE.ENTRY) {
            if (!Game.map[tileY][tileX].lit) lightTile(tileX, tileY);
        }
    }
}

export function lightTile(tileX, tileY) {
    if (Game.stage === STAGE.DARK_TUNNEL) {
        if (Game.darkTiles[tileY][tileX].alpha === 1) {
            Game.darkTiles[tileY][tileX].alpha = Game.darkTiles[tileY][tileX].semiAlpha;
        }
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
        if (!secondaryEntity.visible && !secondaryEntity.dead && secondaryEntity.immediateReaction) {
            secondaryEntity.immediateReaction();
        }
        secondaryEntity.visible = true;
    }

    if (Game.map[tileY][tileX].hazard) {
        Game.map[tileY][tileX].hazard.visible = true;
    }
    if (Game.map[tileY][tileX].item) {
        Game.map[tileY][tileX].item.visible = true;
    }

    if (Game.map[tileY][tileX].tileType === TILE_TYPE.VOID) return;
    Game.minimap[tileY][tileX].visible = true;
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

    if (Game.map[tileY][tileX].tileType === TILE_TYPE.VOID) return;
    Game.minimap[tileY][tileX].visible = false;
}

//const torchLightSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
const torchLightSprite = {};

function lightWorldDT(tileX, tileY, distance, sourceDirX = 0, sourceDirY = 0) {
    if (distance > -1) {
        if (Game.map[tileY][tileX].tileType !== TILE_TYPE.WALL && Game.map[tileY][tileX].tileType !== TILE_TYPE.SUPER_WALL && (Game.bossEntryOpened || !(tileX === Game.bossEntry.x && tileY === Game.bossEntry.y))) {
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