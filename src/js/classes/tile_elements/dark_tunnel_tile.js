import {removeObjectFromArray} from "../../utils/basic_utils";
import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {getCardinalDirections} from "../../utils/map_utils";
import {isEntity, isNotAWall, isNotOutOfMap} from "../../map_checks";
import {DarknessTile} from "../draw/darkness";
import {ROLE, TILE_TYPE} from "../../enums";
import {wallTallness} from "../draw/wall";
import {lightTile} from "../../drawing/lighting";
import {Z_INDEXES} from "../../z_indexing";

//todo: mobs can now pop out of the darkness
export class DarkTunnelTile extends DarknessTile {
    constructor(tilePositionX, tilePositionY, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY);
        this.tint = 0x000000;
        this.dark = true;
        this.lightSources = [];
        this.nearbyAlpha = 0.70;
        //this.semiAlpha = 0.93; // transparent dark tiles don't work together well. you would need a proper blend mode for it but which one?
        this.semiAlpha = 1;
        this.setOwnZIndex(Z_INDEXES.DARK_TUNNEL_DARKNESS);
    }

    addLightSource(lightSource) {
        this.lightSources.push(lightSource);
        this.recalculateLight();
        this.lightNearby();
        this.dark = false;
        this.updateNearbyDarkTiles();
    }

    update() {
        super.update();
        const upTile = {x: this.tilePosition.x, y: this.tilePosition.y - 1};
        if (isNotOutOfMap(upTile.x, upTile.y)
            && (Game.darkTiles[upTile.y][upTile.x].alpha < this.semiAlpha || Game.darkTiles[upTile.y][upTile.x].visible === false)
            && (Game.map[upTile.y][upTile.x].tileType === TILE_TYPE.NONE || isEntity(upTile.x, upTile.y, ROLE.WALL_TRAP))
            && Game.map[upTile.y + 1][upTile.x].tileType === TILE_TYPE.NONE) {
            this.height = Game.TILESIZE;
            this.place();
        } else {
            this.height = Game.TILESIZE + wallTallness;
            this.place();
        }
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
        if (isNotAWall(this.tilePosition.x, this.tilePosition.y)) {
            for (const dir of getCardinalDirections()) {
                Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].alpha = this.nearbyAlpha;
                if (!Game.map[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].lit) {
                    lightTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
                }
                Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].updateNearbyDarkTiles();
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
            if (foundLight) this.alpha = this.nearbyAlpha;
            else this.alpha = this.semiAlpha;
        } else {
            this.visible = false;
        }
    }
}