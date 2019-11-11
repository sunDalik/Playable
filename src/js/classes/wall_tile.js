import {Game} from "../game"
import {FullTileElement} from "./full_tile_element";

export class WallTile extends FullTileElement {
    constructor(tilePositionX = 0, tilePositionY = 0) {
        super(Game.resources["src/images/wall.png"].texture, tilePositionX, tilePositionY);
    }
}