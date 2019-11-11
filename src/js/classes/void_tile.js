import {Game} from "../game"
import {FullTileElement} from "./full_tile_element";

export class VoidTile extends FullTileElement {
    constructor(tilePositionX = 0, tilePositionY = 0) {
        super(Game.resources["src/images/void.png"].texture, tilePositionX, tilePositionY);
    }
}