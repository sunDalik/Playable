import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import {TILE_TYPE} from "../../enums";
import {redrawMiniMapPixel} from "../../drawing/minimap";

//todo all enemies should NOT go through closed doors
export class DoorsTile extends TileElement {
    constructor(tilePositionX, tilePositionY, isHorizontal, texture = Game.resources["src/images/door_horizontal.png"].texture) {
        super(texture, tilePositionX, tilePositionY, true);
        this.horizontal = isHorizontal; //describes connection way
        this.opened = false;
        this.door2 = new TileElement(Game.resources["src/images/door_horizontal.png"].texture, this.tilePosition.x, this.tilePosition.y, true);
        this.scaleModifier = this.door2.scaleModifier = 0.5;
        this.updateTexture();
        this.setOwnZIndex(Z_INDEXES.DOOR);
        if (this.horizontal) {
            this.door2.zIndex = getZIndexForLayer(this.door2.tilePosition.y + 1, true) - 1;
            this.door2.visible = false;
        }
    }

    fitToTile() {
        super.fitToTile();
        //if (this.horizontal) this.scale.y = -1 * Math.abs(this.scale.y);
        if (this.door2) {
            this.door2.fitToTile();
            if (!this.horizontal) this.door2.scale.x = -1 * Math.abs(this.scale.x);
        }
    }

    open(tileStepX, tileStepY) {
        this.opened = true;
        this.updateTexture();
        //todo uuuuhhh directional open.... you will need more textures for it....
        Game.map[this.tilePosition.y][this.tilePosition.x].tileType = TILE_TYPE.NONE;
        redrawMiniMapPixel(this.tilePosition.x, this.tilePosition.y);
    }

    place() {
        super.place();
        if (this.horizontal) {
            this.position.y = Game.TILESIZE * this.tilePosition.y - this.height / 2;
            if (this.door2) this.door2.position.set(this.position.x, this.position.y + Game.TILESIZE - this.height * 0.1);
            if (!this.opened) this.position.y += this.height * 0.35; // MAGICAL NUMBERS AAAAAAAAAAA
            else this.position.y += this.height * 0.03;
        } else {
            this.position.y = this.position.y - Game.TILESIZE / 2;
            this.position.x = this.position.x - (Game.TILESIZE - this.width) / 2;
            if (this.door2) this.door2.position.set(this.position.x + this.width, this.position.y);
        }
    }

    updateTexture() {
        if (this.horizontal === this.opened) {
            this.texture = this.door2.texture = Game.resources["src/images/door_horizontal.png"].texture;
        } else {
            this.texture = this.door2.texture = Game.resources["src/images/door_vertical.png"].texture;
        }
        this.fitToTile();
        this.place();
    }
}