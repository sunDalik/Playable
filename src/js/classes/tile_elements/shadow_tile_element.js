import * as PIXI from "pixi.js"
import {Game} from "../../game"
import {floorLevel, TileElement} from "./tile_element";
import {STAGE} from "../../enums";


export class ShadowTileElement extends TileElement {
    constructor(texture, tilePositionX, tilePositionY, keepInside = false) {
        super(texture, tilePositionX, tilePositionY, keepInside);
        this.noShadow = false;
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
    }

    fitToTile() {
        super.fitToTile();
        if (this.shadow) this.regenerateShadow()
    }

    regenerateShadow() {
        Game.world.removeChild(this.shadow);
        if (this.noShadow) return;
        this.shadow = new PIXI.Graphics();
        //should shadow color be affected by floor? I have no idea
        if (Game.stage === STAGE.DARK_TUNNEL) this.shadow.beginFill(0x444444, 0.2);
        else this.shadow.beginFill(0x666666, 0.12);
        this.shadow.drawEllipse(0, 0, (this.texture.trim.right - this.texture.trim.left) * this.scale.y * 0.5, 8);
        Game.world.addChild(this.shadow);
    }

    place() {
        super.place();
        if (this.shadow) this.placeShadow();
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