import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import * as PIXI from "pixi.js";


export class DoorsTile extends TileElement {
    constructor(tilePositionX, tilePositionY, isHorizontal, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY, true);
        this.horizontal = isHorizontal; //describes connection way
        this.opened = false;
        this.updateTexture();
        this.setOwnZIndex(Z_INDEXES.DOOR);
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
            door1.texture = door2.texture = PIXI.Texture.WHITE;
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