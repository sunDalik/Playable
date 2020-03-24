import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";

export class WallTile extends TileElement {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/wall.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.ownZIndex = Z_INDEXES.WALL;
        this.correctZIndex();
    }

    correctZIndex() {
        this.zIndex = getZIndexForLayer(this.tilePosition.y, true) + this.ownZIndex;
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
    }
}