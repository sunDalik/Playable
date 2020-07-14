import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {canBeFliedOverByBullet, getPlayerOnTile, isAnyWall, isEnemy} from "../../map_checks";
import {EQUIPMENT_ID, HAZARD_TYPE, STAGE, TILE_TYPE} from "../../enums";
import {lightPlayerPosition} from "../../drawing/lighting";
import {otherPlayer} from "../../utils/game_utils";
import {redrawMiniMapPixel} from "../../drawing/minimap";
import {runDestroyAnimation} from "../../animations";
import {SummonCircle} from "../enemies/ru/summon_circle";
import {updateIntent} from "../../game_logic";
import {camera} from "./camera";
import {removeAllChildrenFromContainer} from "../../drawing/draw_utils";

export class World extends PIXI.Container {
    constructor() {
        super();
        this.filters = [];
        this.upWorld = new PIXI.Container();
        Game.app.stage.addChild(this.upWorld);
        this.upWorld.zIndex = this.zIndex + 1;
        this.sortableChildren = true;
        this.upWorld.sortableChildren = true;
        this.interactiveChildren = false;
        this.upWorld.interactiveChildren = false;
    }

    render(renderer) {
        // if the object is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
            return;
        }

        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || (this.filters && this.filters.length)) {
            this.renderAdvanced(renderer);
        } else {
            this._render(renderer);
            // children rendering with custom culling!
            const externalTiles = 2;
            const left = Math.floor((camera.x - Game.app.renderer.screen.width / 2) / Game.TILESIZE) - externalTiles;
            const right = Math.floor((camera.x + Game.app.renderer.screen.width / 2) / Game.TILESIZE) + externalTiles;
            const up = Math.floor((camera.y - Game.app.renderer.screen.height / 2) / Game.TILESIZE) - externalTiles;
            const down = Math.floor((camera.y + Game.app.renderer.screen.height / 2) / Game.TILESIZE) + externalTiles;
            for (let i = 0, j = this.children.length; i < j; ++i) {
                const child = this.children[i];
                if (!child.tilePosition
                    || (child.tilePosition.y >= up && child.tilePosition.y <= down
                        && child.tilePosition.x >= left && child.tilePosition.x <= right)) {
                    child.render(renderer);
                }
            }
        }
    }

    addHazard(hazard) {
        if (isAnyWall(hazard.tilePosition.x, hazard.tilePosition.y, true, false)) return false;

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
            if (competingHazard.type === HAZARD_TYPE.FIRE) {
                competingHazard.removeFromWorld();
                if (!competingHazard.small && hazard.small) {
                    hazard.small = false;
                    hazard.atk = hazard.actualAtk;
                }
                hazard.addToWorld();
            }
            if (competingHazard.type === HAZARD_TYPE.DARK_POISON
                || competingHazard.type === HAZARD_TYPE.POISON) {
                competingHazard.removeFromWorld();
                hazard.addToWorld();
            }
        }
    }

    addBullet(bullet) {
        Game.bullets.push(bullet);
        this.addChild(bullet);
        if (isEnemy(bullet.tilePosition.x, bullet.tilePosition.y) || getPlayerOnTile(bullet.tilePosition.x, bullet.tilePosition.y) !== null) {
            bullet.attack(Game.map[bullet.tilePosition.y][bullet.tilePosition.x].entity);
        } else if (canBeFliedOverByBullet(bullet.tilePosition.x, bullet.tilePosition.y)) {
            bullet.placeOnMap();
        } else {
            bullet.die();
        }
    }

    addEnemy(enemy, isMinion = true) {
        enemy.placeOnMap();
        Game.world.addChild(enemy);
        updateIntent(enemy);
        Game.enemies.push(enemy);
        enemy.place();
        if (isMinion) {
            enemy.isMinion = true;
        }
    }

    addInanimate(inanimate) {
        Game.map[inanimate.tilePosition.y][inanimate.tilePosition.x].entity = inanimate;
        this.addChild(inanimate);
        Game.inanimates.push(inanimate);
    }

    addEnemyViaSummonCircle(enemy, delay) {
        const summonCircle = new SummonCircle(enemy.tilePosition.x, enemy.tilePosition.y, enemy);
        Game.world.addChild(summonCircle);
        Game.enemies.push(summonCircle);
        if (delay !== undefined) {
            summonCircle.setDelay(delay);
        }
    }

    clean() {
        removeAllChildrenFromContainer(this.upWorld);
        for (let i = this.children.length - 1; i >= 0; i--) {
            const child = this.children[i];
            this.removeChild(child);
            if (child.purge && !child.purged) child.purge();
        }
        for (const animation of Game.infiniteAnimations) {
            Game.app.ticker.remove(animation);
        }
        for (const entity of Game.enemies.concat(Game.inanimates)) {
            if (entity.animation) {
                Game.app.ticker.remove(entity.animation);
            }
        }
    }

    removeTile(x, y, remover = null, animate = true) {
        this.removeChild(Game.map[y][x].tile);
        Game.map[y][x].tileType = TILE_TYPE.NONE;
        if (remover) {
            if (Game.stage === STAGE.DARK_TUNNEL) {
                if (remover.secondHand && remover.secondHand.id === EQUIPMENT_ID.TORCH) {
                    lightPlayerPosition(remover);
                } else if (!otherPlayer(remover).dead && otherPlayer(remover).secondHand && otherPlayer(remover).secondHand.id === EQUIPMENT_ID.TORCH) {
                    lightPlayerPosition(otherPlayer(remover));
                } else lightPlayerPosition(remover);
            } else lightPlayerPosition(remover);
        }
        redrawMiniMapPixel(x, y);
        if (animate && Game.map[y][x].tile) {
            runDestroyAnimation(Game.map[y][x].tile);
        }
        if (Game.map[y][x].tile && Game.map[y][x].tile.onTileDestroy) Game.map[y][x].tile.onTileDestroy();
        Game.map[y][x].tile = null;
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
        redrawMiniMapPixel(tile.tilePosition.x, tile.tilePosition.y);
    }

    addTile(tile, tileType, x = 0, y = 0) {
        if (tile) {
            this.addChild(tile);
            Game.map[tile.tilePosition.y][tile.tilePosition.x].tile = tile;
            Game.map[tile.tilePosition.y][tile.tilePosition.x].tileType = tileType;
            redrawMiniMapPixel(tile.tilePosition.x, tile.tilePosition.y);
        } else {
            Game.map[y][x].tileType = tileType;
            redrawMiniMapPixel(x, y);
        }
    }
}