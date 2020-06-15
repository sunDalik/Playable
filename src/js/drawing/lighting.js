import {Game} from "../game";
import {EQUIPMENT_TYPE, STAGE, TILE_TYPE, TOOL_TYPE} from "../enums";
import {getCardinalDirections} from "../utils/map_utils";
import {isNotOutOfMap} from "../map_checks";

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
                if (isNotOutOfMap(lightSource.x, lightSource.y))//this is bad...
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
        //you should get rid of it and replace it with a new system where an entire room lights up when you enter it ???
        const roomDist = 9;
        if (Game.map[py][px].tileType === TILE_TYPE.NONE || Game.map[py][px].tileType === TILE_TYPE.ENTRY) {
            lightWorld(px, py, roomDist);
        }
    }
}

function lightWorld(tileX, tileY, distance, crossEntries = false, sourceDirX = 0, sourceDirY = 0, spreadStart = true) {
    const tileType = Game.map[tileY][tileX].tileType;
    if (distance > -1) {
        if ((tileType === TILE_TYPE.ENTRY && (crossEntries === true || spreadStart === true))
            || tileType === TILE_TYPE.NONE || tileType === TILE_TYPE.EXIT) {
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
                //todo should be else????
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
    const mapCell = Game.map[tileY][tileX];
    if (Game.stage === STAGE.DARK_TUNNEL) {
        if (Game.darkTiles[tileY][tileX].alpha === 1) {
            Game.darkTiles[tileY][tileX].alpha = Game.darkTiles[tileY][tileX].semiAlpha;
        }
    } else {
        Game.darkTiles[tileY][tileX].visible = false;
    }
    mapCell.lit = true;

    for (const dir of getCardinalDirections()) {
        if (isNotOutOfMap(tileX + dir.x, tileY + dir.y)) {
            Game.darkTiles[tileY + dir.y][tileX + dir.x].update();
        }
    }

    const entity = mapCell.entity;
    if (entity) {
        if (!entity.visible && !entity.dead && entity.immediateReaction) {
            entity.immediateReaction();
        }
        entity.visible = true;
    }

    const secondaryEntity = mapCell.secondaryEntity;
    if (secondaryEntity) {
        if (!secondaryEntity.visible && !secondaryEntity.dead && secondaryEntity.immediateReaction) {
            secondaryEntity.immediateReaction();
        }
        secondaryEntity.visible = true;
    }

    if (mapCell.hazard) mapCell.hazard.visible = true;
    if (mapCell.tile) {
        mapCell.tile.visible = true;
        if (mapCell.tile.door2) mapCell.tile.door2.visible = true;
    }
    if (mapCell.item) mapCell.item.visible = true;

    if (mapCell.tileType === TILE_TYPE.VOID) return;
    Game.minimap[tileY][tileX].visible = true;
}

export function darkenTile(tileX, tileY) {
    const mapCell = Game.map[tileY][tileX];

    if (Game.stage === STAGE.DARK_TUNNEL) {
        Game.darkTiles[tileY][tileX].alpha = 1;
    } else {
        Game.darkTiles[tileY][tileX].visible = true;
    }

    mapCell.lit = false;
    if (mapCell.entity) mapCell.entity.visible = false;
    if (mapCell.secondaryEntity) mapCell.secondaryEntity.visible = false;
    if (mapCell.hazard) mapCell.hazard.visible = false;
    if (mapCell.tile) mapCell.tile.visible = false;
    if (mapCell.item) mapCell.item.visible = false;

    if (mapCell.tileType === TILE_TYPE.VOID) return;
    Game.minimap[tileY][tileX].visible = false;
}

//const torchLightSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
const torchLightSprite = {};

//todo dont cross entries!
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