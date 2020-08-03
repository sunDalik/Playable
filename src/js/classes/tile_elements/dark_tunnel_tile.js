import {removeObjectFromArray} from "../../utils/basic_utils";
import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {getCardinalDirections} from "../../utils/map_utils";
import {isEntity, isNotAWall, isNotOutOfMap, isWallTrap} from "../../map_checks";
import {DarknessTile} from "../draw/darkness";
import {ROLE, TILE_TYPE} from "../../enums/enums";
import {wallTallness} from "../draw/wall";
import {lightTile} from "../../drawing/lighting";
import {Z_INDEXES} from "../../z_indexing";

export class DarkTunnelTile extends DarknessTile {
    constructor(tilePositionX, tilePositionY, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY);
        this.tint = 0x000000;
        this.lightSources = [];
        this.nearbyAlpha = 0.70;
        //this.semiAlpha = 0.93; // transparent dark tiles don't work together well. you would need a proper blend mode for it but which one?
        this.semiAlpha = 1;
        this.setOwnZIndex(Z_INDEXES.DARK_TUNNEL_DARKNESS);
    }

    addLightSource(lightSource) {
         if (!Game.map[this.tilePosition.y][this.tilePosition.x].lit) lightTile(this.tilePosition.x, this.tilePosition.y);
        this.lightSources.push(lightSource);
        this.recalculateLight();
        if (!lightSource.weak) this.lightNearby();
        this.updateNearbyDarkTiles();
    }

    update() {
        super.update();
        // if there is a lit floor above us shrink down because that looks nicer
        // also shrink if there is a laser turret because we want to see the face
        //todo should also shrink if exit tile...
        const upTile = {x: this.tilePosition.x, y: this.tilePosition.y - 1};
        if (isNotOutOfMap(upTile.x, upTile.y)
            && (Game.darkTiles[upTile.y][upTile.x].alpha < this.semiAlpha || Game.darkTiles[upTile.y][upTile.x].visible === false)
            && (Game.map[upTile.y][upTile.x].tileType === TILE_TYPE.NONE || isEntity(upTile.x, upTile.y, ROLE.WALL_TRAP))
            && Game.map[upTile.y + 1][upTile.x].tileType === TILE_TYPE.NONE) {
            this.height = Game.TILESIZE;
        } else {
            this.height = Game.TILESIZE + wallTallness;
        }

        this.place();

        // if there is a wall below us shrink up because z index is high in DT
        const downTile = {x: this.tilePosition.x, y: this.tilePosition.y + 1};
        if (isNotOutOfMap(downTile.x, downTile.y)
            && (Game.darkTiles[downTile.y][downTile.x].alpha < this.semiAlpha || Game.darkTiles[downTile.y][downTile.x].visible === false)
            && (Game.map[downTile.y][downTile.x].tileType === TILE_TYPE.WALL || Game.map[downTile.y][downTile.x].tileType === TILE_TYPE.SUPER_WALL)) {
            this.height -= wallTallness;
            this.place();
            this.position.y -= (Game.TILESIZE - wallTallness);
        }
    }

    removeLightSource(lightSource) {
        removeObjectFromArray(lightSource, this.lightSources);
        if (this.lightSources.length === 0) {
            this.checkNearbyLight();
        }
        this.recalculateLight();
    }

    lightNearby() {
        if (isNotAWall(this.tilePosition.x, this.tilePosition.y) || isWallTrap(this.tilePosition.x, this.tilePosition.y)) {
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
                Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].isDark() &&
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
                    && Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].isDark() === false) {
                    foundLight = true;
                    break;
                }
            }
            if (foundLight) this.alpha = this.nearbyAlpha;
            else this.alpha = this.semiAlpha;
            this.updateNearbyDarkTiles(); // this might or might not be redundant...
        } else {
            if (this.lightSources.every(lightSource => lightSource.weak)) {
                this.alpha = this.nearbyAlpha;
                this.visible = true;
            } else this.visible = false;
        }
    }

    isDark() {
        return this.lightSources.length === 0 || this.lightSources.every(lightSource => lightSource.weak);
    }
}