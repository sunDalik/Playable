import {removeObjectFromArray} from "../../utils/basic_utils";
import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {getCardinalDirections} from "../../utils/map_utils";
import {isNotAWall, isNotOutOfMap} from "../../map_checks";
import {DarknessTile} from "../draw/darkness";
import {TILE_TYPE} from "../../enums";
import {wallTallness} from "../draw/wall";

export class DarkTunnelTile extends DarknessTile {
    constructor(tilePositionX, tilePositionY, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY);
        this.tint = 0x000000;
        this.dark = true;
        this.lightSources = [];
        this.nearbyAlpha = 0.70;
        this.semiAlpha = 0.93;
    }

    addLightSource(lightSource) {
        this.lightSources.push(lightSource);
        this.recalculateLight();
        this.lightNearby();
        this.dark = false;
    }

    removeLightSource(lightSource) {
        removeObjectFromArray(lightSource, this.lightSources);
        if (this.lightSources.length === 0) {
            this.dark = true;
            this.checkNearbyLight();
        }
        this.recalculateLight();
    }

    lightNearby() {
        if (isNotAWall(this.tilePosition.x, this.tilePosition.y)
            && (Game.bossEntryOpened || !(this.tilePosition.x === Game.bossEntry.x && this.tilePosition.y === Game.bossEntry.y))) {
            for (const dir of getCardinalDirections()) {
                Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].alpha = this.nearbyAlpha;
            }
        }
    }

    checkNearbyLight() {
        for (const dir of getCardinalDirections()) {
            if (isNotOutOfMap(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) &&
                Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].dark &&
                Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].alpha <= this.nearbyAlpha) {
                Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].recalculateLight();
            }
        }
    }

    recalculateLight() {
        if (this.lightSources.length === 0) {
            this.visible = true;

            let foundLight = false;
            for (const dir of getCardinalDirections()) {
                if (isNotOutOfMap(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)
                    && Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].dark === false) {
                    foundLight = true;
                    break;
                }
            }
            if (foundLight) Game.darkTiles[this.tilePosition.y][this.tilePosition.x].alpha = this.nearbyAlpha;
            else {
                Game.darkTiles[this.tilePosition.y][this.tilePosition.x].alpha = this.semiAlpha;
                for (const dir of getCardinalDirections()) {
                    if (isNotOutOfMap(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                        const tile = Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x];
                        if (tile.alpha >= tile.semiAlpha) {
                            //tile.height = Game.TILESIZE;
                            //tile.place();
                        }
                    }
                }
            }
        } else {
            this.visible = false;
        }
    }


    update() {
        return;
        for (const y of [-1, 1]) {
            if (isNotOutOfMap(this.tilePosition.x, this.tilePosition.y + y)
                && Game.map[this.tilePosition.y + y][this.tilePosition.x].lit
                && (y === -1 || Game.map[this.tilePosition.y + y][this.tilePosition.x].tileType === TILE_TYPE.WALL
                    || Game.map[this.tilePosition.y + y][this.tilePosition.x].tileType === TILE_TYPE.SUPER_WALL)) {
                if (y === -1) {
                    this.height = Game.TILESIZE + wallTallness;
                    this.place();
                    this.position.y -= wallTallness / 2;
                } else {
                    this.height = Game.TILESIZE;
                    this.place();
                    this.position.y -= wallTallness;

                    Game.darkTiles[this.tilePosition.y + y][this.tilePosition.x].height = Game.TILESIZE + wallTallness;
                    //Game.darkTiles[this.tilePosition.y + y][this.tilePosition.x].place();
                    Game.darkTiles[this.tilePosition.y + y][this.tilePosition.x].position.y -= wallTallness / 2;
                }
            }
        }
    }
}