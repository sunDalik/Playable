import {Game} from "../../game"
import {FullTileElement} from "./full_tile_element";
import {removeObjectFromArray} from "../../utils/basic_utils";
import {removeAllChildrenFromContainer} from "../../drawing/draw_utils";
import * as PIXI from "pixi.js";

export class DarkTunnelTile extends FullTileElement {
    constructor(tilePositionX, tilePositionY, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY);
        this.tint = 0x000000;
        this.zIndex = 10;
        this.dark = true;
        this.lightSources = [];
        this.maskContainer = new PIXI.Container();
    }

    //lightSources are TileElements!
    addLightSource(lightSource) {
        this.lightSources.push(lightSource);
        this.recalculateLight();
        this.dark = false;
    }

    removeLightSource(lightSource) {
        removeObjectFromArray(lightSource, this.lightSources);
        if (this.lightSources.length === 0) {
            this.dark = true;
        }
        this.recalculateLight();
    }

    recalculateLight() {
        if (this.lightSources.length === 0) this.mask = null;
        else if (this.lightSources.length === 1) this.mask = this.lightSources[0];
        else {
            removeAllChildrenFromContainer(this.maskContainer);
            for (const lightSource of this.lightSources) this.maskContainer.addChild(lightSource);
            this.mask = new PIXI.Sprite(Game.APP.renderer.generateTexture(this.maskContainer));
        }
    }
}