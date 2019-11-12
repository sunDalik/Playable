import {Game} from "../game"
import {TileElement} from "./tile_element"

export class TallTileElement extends TileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.tileHeight = 2;
        this.placedAtBottom = true;
        this.place();
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        if (this.placedAtBottom) {
            this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE * (this.tileHeight - 1) +
                (Game.TILESIZE * this.tileHeight - this.height) + this.height * this.anchor.y;
        } else this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE * (this.tileHeight - 1) +
            this.height * this.anchor.y;
    }

    fitToTile() {
        //yeah its kinda... full tall tile element...
        const scaleX = Game.TILESIZE / this.getUnscaledWidth();
        const scaleY = scaleX;
        this.scale.set(scaleX, scaleY);
    }
}