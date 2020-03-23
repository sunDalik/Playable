import {removeObjectFromArray} from "../../utils/basic_utils";
import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {getCardinalDirections} from "../../utils/map_utils";
import {isNotAWall, isNotOutOfMap} from "../../map_checks";
import {DarknessTile} from "../draw/darkness";

export class DarkTunnelTile extends DarknessTile {
    constructor(tilePositionX, tilePositionY, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY);
        this.tint = 0x000000;
        this.dark = true;
        this.lightSources = [];
        this.nearbyAlpha = 0.70;
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