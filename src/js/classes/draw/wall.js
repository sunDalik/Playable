import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import {STAGE} from "../../enums";
import {WallsSpriteSheet} from "../../loader";
import {randomChoice} from "../../utils/random_utils";

export let wallTallness = 0;

export class WallTile extends TileElement {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/wall.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.setOwnZIndex(Z_INDEXES.WALL);
        this.setCenterPreservation();
        this.setTexture();
        if (wallTallness === 0) wallTallness = 128 * this.scale.y; // in theory it might initialize AFTER someone will need it... keep it in mind
    }

    setTexture() {
        if (Game.stage === STAGE.FLOODED_CAVE) {

        } else if (Game.stage === STAGE.DARK_TUNNEL) {
            this.texture = Game.resources["src/images/walls/dark_tunnel_walls_0.png"].texture;
        } else if (Game.stage === STAGE.RUINS) {
            const random = Math.random() * 100;
            if (random > 99) {
                // cracked
                this.texture = WallsSpriteSheet["ruins_walls_9.png"];
            } else if (random > 97) {
                // broken + indented
                this.texture = WallsSpriteSheet["ruins_walls_4.png"];
            } else if (random > 90) {
                // broken
                this.texture = randomChoice([WallsSpriteSheet["ruins_walls_3.png"],
                    WallsSpriteSheet["ruins_walls_5.png"]]);
            } else if (random > 75) {
                // extruded bricks
                this.texture = randomChoice([WallsSpriteSheet["ruins_walls_7.png"],
                    WallsSpriteSheet["ruins_walls_10.png"]]);
            } else {
                // normal
                this.texture = randomChoice([WallsSpriteSheet["ruins_walls_2.png"],
                    WallsSpriteSheet["ruins_walls_6.png"],
                    WallsSpriteSheet["ruins_walls_8.png"]]);
            }
            this.setScaleModifier(1.02);

        }
    }


    correctZIndex() {
        this.zIndex = getZIndexForLayer(this.tilePosition.y, true) + this.ownZIndex;
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
    }
}