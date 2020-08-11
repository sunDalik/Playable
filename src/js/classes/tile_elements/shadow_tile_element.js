import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {floorLevel, TileElement} from "./tile_element";
import {STAGE} from "../../enums/enums";

//shadows should be invisible if the sprite is invisible... but how?
export class ShadowTileElement extends TileElement {
    constructor(texture, tilePositionX, tilePositionY, keepInside = false) {
        super(texture, tilePositionX, tilePositionY, keepInside);
        this.noShadow = false;
        this.shadowInside = false;
        this.shadowHeight = 8;
        this.shadowWidthMul = 0.5;

        // if set to true, the shadow will stay on the same Y if there is any X movement involved
        this.shadowStepping = false;

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
        if (Game.stage === STAGE.FLOODED_CAVE) this.shadow.beginFill(0x58625f, 0.16);
        else if (Game.stage === STAGE.DARK_TUNNEL) this.shadow.beginFill(0x484a4d, 0.22);
        else this.shadow.beginFill(0x666561, 0.11);
        const width = this.texture.trim ? this.texture.trim.width : this.texture.frame.width;
        this.shadow.drawEllipse(0, 0, width * this.scale.y * this.shadowWidthMul, this.shadowHeight);
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
        if (this.noShadow || this.shadow === null) return;
        this.shadow.zIndex = this.zIndex - 1;
        this.shadow.position.x = this.position.x;
        if (this.shadowStepping === false || Math.abs(this.position.x - this.getTilePositionX()) < 2) {
            this.shadow.position.y = (this.tilePosition.y + 1) * Game.TILESIZE - floorLevel - (this.getTilePositionY() - this.position.y);
        } else {
            this.shadow.position.y = (this.tilePosition.y + 1) * Game.TILESIZE - floorLevel;
        }
    }
}