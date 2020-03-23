import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {TILE_TYPE} from "../../enums";
import {Z_INDEXES} from "../../z_indexing";

export class DarknessTile extends TileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.ownZIndex = Z_INDEXES.DARKNESS;
        this.correctZIndex();
    }

    update() {
        for (const y of [-1, 1]) {
            const off = 100;
            if (Game.map[this.tilePosition.y + y][this.tilePosition.x].lit
                && Game.map[this.tilePosition.y + y][this.tilePosition.x].tileType === TILE_TYPE.WALL) {
                const scaleY = Game.map[this.tilePosition.y + y][this.tilePosition.x].tile.scale.y;
                if (y === -1) {
                    this.height = Game.TILESIZE + off * scaleY;
                    this.place();
                    this.position.y -= off / 2 * scaleY;
                } else {
                    this.height = Game.TILESIZE;
                    this.place();
                    this.position.y -= off * scaleY;
                }
            }
        }
    }
}