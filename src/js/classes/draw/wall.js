import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {Z_INDEXES} from "../../z_indexing";

export class WallTile extends TileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.ownZIndex = Z_INDEXES.WALL;
        this.correctZIndex();
    }


    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
    }
}