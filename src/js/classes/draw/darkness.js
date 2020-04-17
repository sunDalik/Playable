import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {STAGE, TILE_TYPE} from "../../enums";
import {Z_INDEXES} from "../../z_indexing";
import {isNotOutOfMap} from "../../map_checks";
import {wallTallness} from "./wall";

export class DarknessTile extends TileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.setOwnZIndex(Z_INDEXES.DARKNESS);
        if (Game.stage !== STAGE.DARK_TUNNEL
            || [TILE_TYPE.WALL, TILE_TYPE.SUPER_WALL].includes(Game.map[this.tilePosition.y][this.tilePosition.x].tileType)) {
            this.height = Game.TILESIZE + wallTallness;
        }
        this.setCenterPreservation();
    }

    place() {
        super.place();
        const diff = (this.height - Game.TILESIZE);
        this.position.y -= Math.abs(diff) / 2;
    }

    update() {
        if (!this.visible) return;
        if (isNotOutOfMap(this.tilePosition.x, this.tilePosition.y + 1)
            && Game.map[this.tilePosition.y + 1][this.tilePosition.x].lit
            && (Game.map[this.tilePosition.y + 1][this.tilePosition.x].tileType === TILE_TYPE.WALL
                || Game.map[this.tilePosition.y + 1][this.tilePosition.x].tileType === TILE_TYPE.SUPER_WALL)) {
            if (Game.stage !== STAGE.DARK_TUNNEL
                || [TILE_TYPE.WALL, TILE_TYPE.SUPER_WALL].includes(Game.map[this.tilePosition.y][this.tilePosition.x].tileType)) {
                this.height = Game.TILESIZE;
                this.place();
                this.position.y -= wallTallness;
            }
        }

        //doorsss
        if (isNotOutOfMap(this.tilePosition.x, this.tilePosition.y - 1)
            && Game.map[this.tilePosition.y - 1][this.tilePosition.x].lit
            && Game.map[this.tilePosition.y - 1][this.tilePosition.x].tileType === TILE_TYPE.ENTRY) {
            this.height = Game.TILESIZE * 1.34;
            this.place();
        }
    }
}