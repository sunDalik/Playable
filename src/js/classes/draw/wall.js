import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";

export let wallTallness = 0;

export class WallTile extends TileElement {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/wall.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.setOwnZIndex(Z_INDEXES.WALL);
        this.setCenterPreservation();

        if (wallTallness === 0) wallTallness = 128 * this.scale.y; // in theory it might initialize AFTER someone will need it... keep it in mind
    }

    correctZIndex() {
        this.zIndex = getZIndexForLayer(this.tilePosition.y, true) + this.ownZIndex;
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
    }
}