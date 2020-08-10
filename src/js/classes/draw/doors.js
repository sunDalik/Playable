import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import {TILE_TYPE} from "../../enums/enums";
import {redrawMiniMapPixel} from "../../drawing/minimap";
import {CommonSpriteSheet} from "../../loader";

// warning, a lot of magical humbers
export class DoorsTile extends TileElement {
    constructor(tilePositionX, tilePositionY, isHorizontal, texture = CommonSpriteSheet["door_horizontal.png"]) {
        super(texture, tilePositionX, tilePositionY, true);
        this.horizontal = isHorizontal; //describes connection way
        this.opened = false;
        this.door2 = new TileElement(CommonSpriteSheet["door_horizontal.png"], this.tilePosition.x, this.tilePosition.y, true);
        this.scaleModifier = this.door2.scaleModifier = 0.5 * 1.01;
        this.updateTexture();
        this.setOwnZIndex(Z_INDEXES.DOOR);
        if (this.horizontal) {
            this.door2.zIndex = getZIndexForLayer(this.door2.tilePosition.y + 1, true) - 1;
            this.door2.visible = false;
        }
    }

    fitToTile() {
        super.fitToTile();
        if (this.door2) {
            this.door2.fitToTile();
            if (!this.horizontal) this.door2.scale.x = -1 * Math.abs(this.scale.x);
        }
    }

    open(tileStepX, tileStepY) {
        this.opened = true;
        this.updateTexture();
        if (tileStepX === -1 && this.horizontal) {
            this.door2.anchor.x = this.anchor.x = -0.15;
            this.door2.scale.x = this.scale.x = Math.abs(this.scale.x) * -1;
        } else if (tileStepY === 1 && !this.horizontal) {
            this.door2.anchor.y = this.anchor.y = 0.25;
            this.texture = this.door2.texture = CommonSpriteSheet["door_vertical_opposite.png"];
        }
        Game.map[this.tilePosition.y][this.tilePosition.x].tileType = TILE_TYPE.NONE;
        redrawMiniMapPixel(this.tilePosition.x, this.tilePosition.y);
    }

    close() {
        this.opened = false;
        this.updateTexture();
        Game.map[this.tilePosition.y][this.tilePosition.x].tileType = TILE_TYPE.ENTRY;
        redrawMiniMapPixel(this.tilePosition.x, this.tilePosition.y);
    }

    place() {
        super.place();
        if (this.horizontal) {
            this.position.y = Game.TILESIZE * this.tilePosition.y - this.height / 2;
            if (this.door2) this.door2.position.set(this.position.x, this.position.y + Game.TILESIZE - this.height * 0.02);
            if (!this.opened) this.position.y += this.height * 0.32; // MAGICAL NUMBERS AAAAAAAAAAA
            else this.position.y += this.height * 0.1;
        } else {
            this.position.y = this.position.y - Game.TILESIZE / 2;
            this.position.x = this.position.x - (Game.TILESIZE - this.width) / 2;
            if (this.door2) this.door2.position.set(this.position.x + this.width * 0.96, this.position.y);
        }
    }

    updateTexture() {
        if (this.horizontal && !this.opened) {
            this.texture = CommonSpriteSheet["door_vertical_opposite.png"];
            this.door2.texture = CommonSpriteSheet["door_vertical.png"];
        } else if (this.horizontal && this.opened || !this.horizontal && !this.opened) {
            this.texture = this.door2.texture = CommonSpriteSheet["door_horizontal.png"];
        } else {
            this.texture = this.door2.texture = CommonSpriteSheet["door_vertical.png"];
        }
        this.fitToTile();
        this.place();
    }
}