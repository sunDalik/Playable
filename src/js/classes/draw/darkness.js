import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {TILE_TYPE} from "../../enums";
import {getZIndexForLayer} from "../../z_indexing";
import {isNotOutOfMap} from "../../map_checks";

export class DarknessTile extends TileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.correctZIndex();
    }

    correctZIndex() {
        this.zIndex = getZIndexForLayer(Game.map.length);
    }

    update() {
        for (const y of [-1, 1]) {
            const off = 128;
            if (isNotOutOfMap(this.tilePosition.x, this.tilePosition.y + y)
                && Game.map[this.tilePosition.y + y][this.tilePosition.x].lit
                && (Game.map[this.tilePosition.y + y][this.tilePosition.x].tileType === TILE_TYPE.WALL
                    || Game.map[this.tilePosition.y + y][this.tilePosition.x].tileType === TILE_TYPE.SUPER_WALL)) {
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