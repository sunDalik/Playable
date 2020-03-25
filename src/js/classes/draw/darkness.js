import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {TILE_TYPE} from "../../enums";
import {getZIndexForLayer} from "../../z_indexing";
import {isNotOutOfMap} from "../../map_checks";
import {wallTallness} from "./wall";

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
            if (isNotOutOfMap(this.tilePosition.x, this.tilePosition.y + y)
                && Game.map[this.tilePosition.y + y][this.tilePosition.x].lit
                && (Game.map[this.tilePosition.y + y][this.tilePosition.x].tileType === TILE_TYPE.WALL
                    || Game.map[this.tilePosition.y + y][this.tilePosition.x].tileType === TILE_TYPE.SUPER_WALL)) {
                if (y === -1) {
                    this.height = Game.TILESIZE + wallTallness;
                    this.place();
                    this.position.y -= wallTallness / 2;
                } else {
                    this.height = Game.TILESIZE;
                    this.place();
                    this.position.y -= wallTallness;
                }
            }
        }
    }
}