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
        const random = Math.random() * 100;
        if (Game.stage === STAGE.FLOODED_CAVE) {
            this.texture = Game.resources["src/images/floor_tiles/flooded_cave_floor_tile_0.png"].texture;
        } else if (Game.stage === STAGE.DARK_TUNNEL) {
            if (random > 98) {
                //cracked
                this.texture = FloorTilesSpriteSheet["dark_tunnel_floor_tile_8.png"];
            } else if (random > 93) {
                // lava
                this.texture = randomChoice([FloorTilesSpriteSheet["dark_tunnel_floor_tile_6.png"],
                    FloorTilesSpriteSheet["dark_tunnel_floor_tile_7.png"]]);
            } else if (random > 86) {
                // less rocks
                this.texture = randomChoice([FloorTilesSpriteSheet["dark_tunnel_floor_tile_2.png"],
                    FloorTilesSpriteSheet["dark_tunnel_floor_tile_5.png"]]);
            } else {
                // normal
                this.texture = randomChoice([FloorTilesSpriteSheet["dark_tunnel_floor_tile_0.png"],
                    FloorTilesSpriteSheet["dark_tunnel_floor_tile_1.png"],
                    FloorTilesSpriteSheet["dark_tunnel_floor_tile_3.png"],
                    FloorTilesSpriteSheet["dark_tunnel_floor_tile_4.png"]]);
            }
        } else if (Game.stage === STAGE.RUINS) {
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