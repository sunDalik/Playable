import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {floorLevel, TileElement} from "./tile_element";
import {STAGE} from "../../enums";

//shadows should be invisible if the sprite is invisible... but how?
export class ShadowTileElement extends TileElement {
    constructor(texture, tilePositionX, tilePositionY, keepInside = false) {
        super(texture, tilePositionX, tilePositionY, keepInside);
        this.noShadow = false;
        this.shadowInside = false;
        this.shadowHeight = 8;
        this.regenerateShadow();
        this.place();
    }

    removeShadow() {
        this.noShadow = true;
        if (this.shadow) {
            Game.world.removeChild(this.shadow);
            this.shadow = null;
        }
    }

    setShadow() {
        this.noShadow = false;
        this.regenerateShadow();
        this.placeShadow();
    }

    fitToTile() {
        super.fitToTile();
        if (this.shadow) this.regenerateShadow();
    }

    regenerateShadow() {
        Game.world.removeChild(this.shadow);
        if (this.noShadow) return;
        this.shadow = new PIXI.Graphics();
        //should shadow color be affected by floor? I have no idea
        if (Game.stage === STAGE.DARK_TUNNEL) this.shadow.beginFill(0x444444, 0.2);
        else this.shadow.beginFill(0x666666, 0.12);
        const width = this.texture.trim ? this.texture.trim.width : this.texture.frame.width;
        this.shadow.drawEllipse(0, 0, width * this.scale.y * 0.5, this.shadowHeight);
        Game.world.addChild(this.shadow);
        this.placeShadow();
    }

    place() {
        super.place();
        if (this.shadow) this.placeShadow();
    }

    getTilePositionY() {
        if (this.shadowInside) return super.getTilePositionY() + this.shadowHeight;
        else return super.getTilePositionY();
    }

    placeShadow() {
        //todo:they do be still looking kinda weird on y steps
        if (this.noShadow || this.shadow === null) return;
        this.shadow.zIndex = this.zIndex - 1;
        this.shadow.position.x = this.position.x;
        if (Math.abs(this.position.x - this.getTilePositionX()) < 2) {
            this.shadow.position.y = (this.tilePosition.y + 1) * Game.TILESIZE - floorLevel - (this.getTilePositionY() - this.position.y);
        } else {
            this.shadow.position.y = (this.tilePosition.y + 1) * Game.TILESIZE - floorLevel;
        }
    }
}