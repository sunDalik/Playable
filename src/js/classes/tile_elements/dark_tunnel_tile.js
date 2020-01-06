import {FullTileElement} from "./full_tile_element";
import {removeObjectFromArray} from "../../utils/basic_utils";
import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {getCardinalDirections} from "../../utils/map_utils";
import {isNotAWall} from "../../map_checks";

export class DarkTunnelTile extends FullTileElement {
    constructor(tilePositionX, tilePositionY, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY);
        this.tint = 0x000000;
        this.zIndex = 10;
        this.dark = true;
        this.lightSources = [];
        this.nearbyAlpha = 0.73;
        this.semiAlpha = 0.93;
        //this.maskContainer = new PIXI.Container();
    }

    //lightSources are TileElements!
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
        for (const dir of getCardinalDirections()) {
            if (isNotAWall(this.tilePosition.x, this.tilePosition.y)) {
                Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].alpha = this.nearbyAlpha;
            }
        }
    }

    checkNearbyLight() {
        for (const dir of getCardinalDirections()) {
            if (Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].dark && Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].alpha <= this.nearbyAlpha) {
                Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].recalculateLight();
            }
        }
    }

    recalculateLight() {
        if (this.lightSources.length === 0) {
            this.visible = true;

            let foundLight = false;
            for (const dir of getCardinalDirections()) {
                if (Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].dark === false) {
                    foundLight = true;
                    break;
                }
            }
            if (foundLight) Game.darkTiles[this.tilePosition.y][this.tilePosition.x].alpha = this.nearbyAlpha;
            else Game.darkTiles[this.tilePosition.y][this.tilePosition.x].alpha = this.semiAlpha;
        } else {
            this.visible = false;
        }
        //For some reason using masks DESTROYS game's FPS. I have no idea why
        /*
        if (this.lightSources.length === 0) this.mask = null;
        else if (this.lightSources.length === 1) this.mask = this.lightSources[0];
        else {
            removeAllChildrenFromContainer(this.maskContainer);
            for (const lightSource of this.lightSources) this.maskContainer.addChild(lightSource);
            this.mask = new PIXI.Sprite(Game.app.renderer.generateTexture(this.maskContainer));
        }
        */
    }
}