import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {TILE_TYPE} from "../../enums";
import {Z_INDEXES} from "../../z_indexing";
import {isNotOutOfMap} from "../../map_checks";
import {wallTallness} from "./wall";

export class DarknessTile extends TileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.setOwnZIndex(Z_INDEXES.DARKNESS);
        this.height = Game.TILESIZE + wallTallness;
        this.setCenterPreservation();
    }

    place() {
        super.place();
        const diff = (this.height - Game.TILESIZE);
        this.position.y -= diff / 2;
    }

    update() {
        if (!this.visible) return;

        //doorsss
        if (isNotOutOfMap(this.tilePosition.x, this.tilePosition.y - 1)
            && Game.map[this.tilePosition.y - 1][this.tilePosition.x].lit
            && Game.map[this.tilePosition.y - 1][this.tilePosition.x].tileType === TILE_TYPE.ENTRY) {
            this.height = Game.TILESIZE * 1.26;
            this.place();
        }
    }

    updateNearbyDarkTiles() {
        for (const dir of [{x: 0, y: -1}, {x: 0, y: 1}]) {
            if (isNotOutOfMap(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                Game.darkTiles[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].update();
            }
        }
        this.update();
    }
}