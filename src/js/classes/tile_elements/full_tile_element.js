import {Game} from "../../game"
import {TileElement} from "./tile_element"

export class FullTileElement extends TileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
    }

    fitToTile() {
        const scaleX = Game.TILESIZE / this.getUnscaledWidth();
        const scaleY = Game.TILESIZE / this.getUnscaledHeight();
        this.scale.set(scaleX, scaleY);
    }
}