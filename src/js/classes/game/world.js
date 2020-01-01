import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {isEmpty} from "../../map_checks";
import {EQUIPMENT_TYPE, HAZARD_TYPE, ROLE, STAGE, TILE_TYPE, TOOL_TYPE} from "../../enums";
import {removeAllChildrenFromContainer} from "../../drawing/draw_utils";
import {lightPlayerPosition} from "../../drawing/lighting";
import {otherPlayer} from "../../utils/game_utils";
import {recalculateTileInDetectionGraph} from "../../map_generation";
import {redrawMiniMapPixel} from "../../drawing/draw_hud";

export class World extends PIXI.Container {
    constructor() {
        super();
    }

    addHazard(hazard) {
        const competingHazard = Game.map[hazard.tilePosition.y][hazard.tilePosition.x].hazard;
        if (competingHazard === null) {
            hazard.addToWorld();
        } else if (competingHazard.type === hazard.type) {
            competingHazard.refreshLifetime();
        } else if (hazard.type === HAZARD_TYPE.POISON) {
            if (competingHazard.type === HAZARD_TYPE.DARK_POISON || competingHazard.type === HAZARD_TYPE.DARK_FIRE) {
                competingHazard.spoil(hazard);
            } else if (competingHazard.type === HAZARD_TYPE.FIRE) {
                competingHazard.ignite();
            }
        } else if (hazard.type === HAZARD_TYPE.FIRE) {
            if (competingHazard.type === HAZARD_TYPE.DARK_FIRE || competingHazard.type === HAZARD_TYPE.DARK_POISON) {
                competingHazard.spoil(hazard);
            } else if (competingHazard.type === HAZARD_TYPE.POISON) {
                competingHazard.removeFromWorld();
                hazard.addToWorld();
            }
        } else if (hazard.type === HAZARD_TYPE.DARK_POISON) {
            if (competingHazard.type === HAZARD_TYPE.POISON) {
                competingHazard.removeFromWorld();
                hazard.addToWorld();
            } else if (competingHazard.type === HAZARD_TYPE.DARK_FIRE) {
                competingHazard.ignite();
            } else if (competingHazard.type === HAZARD_TYPE.FIRE) {
                competingHazard.turnToDark();
            }
        } else if (hazard.type === HAZARD_TYPE.DARK_FIRE) {
            if (competingHazard.type === HAZARD_TYPE.FIRE
                || competingHazard.type === HAZARD_TYPE.DARK_POISON
                || competingHazard.type === HAZARD_TYPE.POISON) {
                competingHazard.removeFromWorld();
                hazard.addToWorld();
            }
        }
    }

    addBullet(bullet) {
        Game.bullets.push(bullet);
        this.addChild(bullet);
        if (isEmpty(bullet.tilePosition.x, bullet.tilePosition.y)) {
            bullet.placeOnMap();
        } else {
            const entity = Game.map[bullet.tilePosition.y][bullet.tilePosition.x].entity;
            if (entity) {
                if (entity.role === ROLE.ENEMY || entity.role === ROLE.PLAYER) {
                    bullet.attack(Game.map[bullet.tilePosition.y][bullet.tilePosition.x].entity);
                } else if (entity.role === ROLE.BULLET) {
                    bullet.placeOnMap();
                } else bullet.die();
            } else bullet.die();
        }
    }

    clean() {
        removeAllChildrenFromContainer(this);
        for (const animation of Game.infiniteAnimations) {
            Game.app.ticker.remove(animation);
        }
    }

    removeTile(x, y, remover = null) {
        this.removeChild(Game.map[y][x].tile);
        Game.map[y][x].tileType = TILE_TYPE.NONE;
        if (remover) {
            if (Game.stage === STAGE.DARK_TUNNEL) {
                if (remover.secondHand && remover.secondHand.equipmentType === EQUIPMENT_TYPE.TOOL && remover.secondHand.type === TOOL_TYPE.TORCH) {
                    lightPlayerPosition(remover);
                } else if (!otherPlayer(remover).dead && otherPlayer(remover).secondHand && otherPlayer(remover).secondHand.equipmentType === EQUIPMENT_TYPE.TOOL && otherPlayer(remover).secondHand.type === TOOL_TYPE.TORCH) {
                    lightPlayerPosition(otherPlayer(remover));
                } else lightPlayerPosition(remover)
            } else lightPlayerPosition(remover);
        }
        recalculateTileInDetectionGraph(x, y);
        redrawMiniMapPixel(x, y);
    }

    addAndSaveTile(tile, tileType) {
        this.addChild(tile);
        Game.savedTiles.push({
            x: tile.tilePosition.x,
            y: tile.tilePosition.y,
            tile: Game.map[tile.tilePosition.y][tile.tilePosition.x].tile,
            tileType: Game.map[tile.tilePosition.y][tile.tilePosition.x].tileType
        });
        this.removeChild(Game.map[tile.tilePosition.y][tile.tilePosition.x].tile);
        Game.map[tile.tilePosition.y][tile.tilePosition.x].tile = tile;
        Game.map[tile.tilePosition.y][tile.tilePosition.x].tileType = tileType;
        recalculateTileInDetectionGraph(tile.tilePosition.x, tile.tilePosition.y);
        redrawMiniMapPixel(tile.tilePosition.x, tile.tilePosition.y);
    }

    addTile(tile, tileType, x = 0, y = 0) {
        if (tile) {
            this.addChild(tile);
            Game.map[tile.tilePosition.y][tile.tilePosition.x].tile = tile;
            Game.map[tile.tilePosition.y][tile.tilePosition.x].tileType = tileType;
            recalculateTileInDetectionGraph(tile.tilePosition.x, tile.tilePosition.y);
            redrawMiniMapPixel(tile.tilePosition.x, tile.tilePosition.y);
        } else {
            Game.map[y][x].tileType = tileType;
            recalculateTileInDetectionGraph(x, y);
            redrawMiniMapPixel(x, y);
        }
    }
}