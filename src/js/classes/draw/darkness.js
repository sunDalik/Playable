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
        if ([TILE_TYPE.WALL, TILE_TYPE.SUPER_WALL].includes(Game.map[this.tilePosition.y][this.tilePosition.x].tileType)) {
            this.height = Game.TILESIZE + wallTallness;
        }
        this.setCenterPreservation();
    }

    place() {
        super.place();
        const diff = (this.height - Game.TILESIZE);
        this.position.y -= Math.abs(diff) / 2;
    }

    correctZIndex() {
        this.zIndex = getZIndexForLayer(Game.map.length);
    }

    update() {
        if (!this.visible) return;
        for (const y of [1]) {
            if (isNotOutOfMap(this.tilePosition.x, this.tilePosition.y + y)
                && Game.map[this.tilePosition.y + y][this.tilePosition.x].lit
                && (Game.map[this.tilePosition.y + y][this.tilePosition.x].tileType === TILE_TYPE.WALL
                    || Game.map[this.tilePosition.y + y][this.tilePosition.x].tileType === TILE_TYPE.SUPER_WALL)) {
                if ([TILE_TYPE.WALL, TILE_TYPE.SUPER_WALL].includes(Game.map[this.tilePosition.y][this.tilePosition.x].tileType)) {
                    this.height = Game.TILESIZE;
                    this.place();
                    this.position.y -= wallTallness;
                }
            }
        }
    }
}