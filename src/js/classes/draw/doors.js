import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {Z_INDEXES} from "../../z_indexing";
import * as PIXI from "pixi.js";
import {TILE_TYPE} from "../../enums";

//todo all enemies should NOT go through closed doors
export class DoorsTile extends TileElement {
    constructor(tilePositionX, tilePositionY, isHorizontal, texture = Game.resources["src/images/door_horizontal.png"].texture) {
        super(texture, tilePositionX, tilePositionY, true);
        this.horizontal = isHorizontal; //describes connection way
        this.opened = false;
        this.door2 = new TileElement(Game.resources["src/images/door_horizontal.png"].texture, this.tilePosition.x, this.tilePosition.y);
        this.scaleModifier = this.door2.scaleModifier = 0.5;
        this.updateTexture();
        this.setOwnZIndex(Z_INDEXES.DOOR);
    }

    fitToTile() {
        super.fitToTile();
        if (this.door2) this.door2.fitToTile();
    }

    open(tileStepX, tileStepY) {
        this.opened = true;
        this.updateTexture();
        Game.map[this.tilePosition.y][this.tilePosition.x].tileType = TILE_TYPE.NONE;
    }

    place() {
        super.place();
        if (!this.horizontal) this.position.y -= Game.TILESIZE / 3;
    }

    updateTexture() {
        if (this.horizontal === this.opened) {
            this.texture = this.door2.texture = Game.resources["src/images/door_horizontal.png"].texture;
        } else {
            this.texture = this.door2.texture = Game.resources["src/images/door_vertical.png"].texture;
        }
        if (this.horizontal) {
            this.door2.position.y = this.position.y+this.height * 2 - 4;
            this.door2.scale.y *= -1;
        } else {
            this.door2.position.x = this.position.x+this.width * 2 - 4;
            this.door2.scale.x *= -1;
        }
        this.fitToTile();
    }
}