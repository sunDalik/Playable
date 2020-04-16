import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import * as PIXI from "pixi.js";
import {TILE_TYPE} from "../../enums";


export class DoorsTile extends TileElement {
    constructor(tilePositionX, tilePositionY, isHorizontal, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY, true);
        this.horizontal = isHorizontal; //describes connection way
        this.opened = false;
        this.initiateScale();
        this.updateTexture();
        this.setOwnZIndex(Z_INDEXES.DOOR);
    }

    fitToTile() {
        if (this.initialScale) {
            this.scale.set(this.initialScale.x, this.initialScale.y);
        } else {
            super.fitToTile();
        }
    }

    initiateScale() {
        this.initialScale = {};
        this.initialScale.x = Game.TILESIZE / Game.resources["src/images/door_horizontal.png"].texture.width / 2;
        this.initialScale.y = Math.abs(this.initialScale.x);
    }

    open() {
        this.opened = true;
        this.updateTexture();
        Game.map[this.tilePosition.y][this.tilePosition.x].tileType = TILE_TYPE.NONE;
    }

    place() {
        super.place();
        if (!this.horizontal) this.position.y -= Game.TILESIZE / 3;
    }

    updateTexture() {
        if (this.texture !== PIXI.Texture.WHITE) this.texture.destroy();
        const container = new PIXI.Container();
        const door1 = new PIXI.Sprite(PIXI.Texture.WHITE);
        const door2 = new PIXI.Sprite(PIXI.Texture.WHITE);
        container.addChild(door1, door2);
        if (this.horizontal === this.opened) {
            door1.texture = door2.texture = Game.resources["src/images/door_horizontal.png"].texture;
        } else {
            door1.texture = door2.texture = Game.resources["src/images/door_vertical.png"].texture;
        }
        if (this.horizontal) {
            door2.position.y = door1.height * 2 - 4;
            door2.scale.y *= -1;
        } else {
            door2.position.x = door1.width * 2 - 4;
            door2.scale.x *= -1;
        }
        this.texture = Game.app.renderer.generateTexture(container);
        this.fitToTile();
    }
}