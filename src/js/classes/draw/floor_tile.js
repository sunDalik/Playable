import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {STAGE} from "../../enums";
import {FloorTilesSpriteSheet} from "../../loader";
import {randomChoice} from "../../utils/random_utils";


export class FloorTile extends TileElement {
    constructor(tilePositionX, tilePositionY, texture = FloorTilesSpriteSheet["ruins_floor_tile_3.png"]) {
        super(texture, tilePositionX, tilePositionY, true);
        this.setTexture();
    }

    correctZIndex() {
        this.zIndex = randomChoice([-2, -3]);
    }

    setTexture() {
        if (Game.stage === STAGE.FLOODED_CAVE) {

        } else if (Game.stage === STAGE.DARK_TUNNEL) {
            this.texture = randomChoice([Game.resources["src/images/floor_tiles/dark_tunnel_floor_tile_0.png"].texture,
                Game.resources["src/images/floor_tiles/dark_tunnel_floor_tile_1.png"].texture,
                Game.resources["src/images/floor_tiles/dark_tunnel_floor_tile_2.png"].texture]);
        } else if (Game.stage === STAGE.RUINS) {
            const random = Math.random() * 100;
            if (random > 97) {
                // cracked
                this.texture = randomChoice([FloorTilesSpriteSheet["ruins_floor_tile_5.png"],
                    FloorTilesSpriteSheet["ruins_floor_tile_8.png"],
                    FloorTilesSpriteSheet["ruins_floor_tile_11.png"]]);
            } else if (random > 82) {
                // noisy
                this.texture = randomChoice([FloorTilesSpriteSheet["ruins_floor_tile_4.png"],
                    FloorTilesSpriteSheet["ruins_floor_tile_7.png"],
                    FloorTilesSpriteSheet["ruins_floor_tile_10.png"]]);
            } else {
                // normal
                this.texture = randomChoice([FloorTilesSpriteSheet["ruins_floor_tile_3.png"],
                    FloorTilesSpriteSheet["ruins_floor_tile_6.png"],
                    FloorTilesSpriteSheet["ruins_floor_tile_9.png"]]);
            }
        }
        this.setScaleModifier(1.002);
    }
}