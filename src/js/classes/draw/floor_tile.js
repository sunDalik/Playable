import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {STAGE} from "../../enums/enums";
import {randomChoice} from "../../utils/random_utils";
import {
    DCTilesetSpriteSheet,
    DTTilesetSpriteSheet,
    FCTilesetSpriteSheet,
    MMTilesetSpriteSheet,
    RUTilesetSpriteSheet
} from "../../loader";

export class FloorTile extends TileElement {
    constructor(tilePositionX, tilePositionY, texture = FCTilesetSpriteSheet["flooded_cave_floor_tile_0.png"]) {
        super(texture, tilePositionX, tilePositionY, true);
        this.setScaleModifier(1.002);
        this.setTexture();
    }

    correctZIndex() {
        this.zIndex = randomChoice([-2, -3]);
    }

    setTexture() {
        const random = Math.random() * 100;
        if (Game.stage === STAGE.FLOODED_CAVE) {
            if (random > 94) {
                //cracked
                this.texture = randomChoice([FCTilesetSpriteSheet["flooded_cave_floor_tile_5.png"],
                    FCTilesetSpriteSheet["flooded_cave_floor_tile_6.png"],
                    FCTilesetSpriteSheet["flooded_cave_floor_tile_7.png"]]);
            } else {
                // normal
                this.texture = randomChoice([FCTilesetSpriteSheet["flooded_cave_floor_tile_0.png"],
                    FCTilesetSpriteSheet["flooded_cave_floor_tile_1.png"],
                    FCTilesetSpriteSheet["flooded_cave_floor_tile_2.png"],
                    FCTilesetSpriteSheet["flooded_cave_floor_tile_3.png"],
                    FCTilesetSpriteSheet["flooded_cave_floor_tile_4.png"],
                    FCTilesetSpriteSheet["flooded_cave_floor_tile_8.png"]]);
            }
        } else if (Game.stage === STAGE.DARK_TUNNEL) {
            if (random > 98) {
                //cracked
                this.texture = DTTilesetSpriteSheet["dark_tunnel_floor_tile_8.png"];
            } else if (random > 93) {
                // lava
                this.texture = randomChoice([DTTilesetSpriteSheet["dark_tunnel_floor_tile_6.png"],
                    DTTilesetSpriteSheet["dark_tunnel_floor_tile_7.png"]]);
            } else if (random > 86) {
                // less rocks
                this.texture = randomChoice([DTTilesetSpriteSheet["dark_tunnel_floor_tile_2.png"],
                    DTTilesetSpriteSheet["dark_tunnel_floor_tile_5.png"]]);
            } else {
                // normal
                this.texture = randomChoice([DTTilesetSpriteSheet["dark_tunnel_floor_tile_0.png"],
                    DTTilesetSpriteSheet["dark_tunnel_floor_tile_1.png"],
                    DTTilesetSpriteSheet["dark_tunnel_floor_tile_3.png"],
                    DTTilesetSpriteSheet["dark_tunnel_floor_tile_4.png"]]);
            }
        } else if (Game.stage === STAGE.RUINS) {
            if (random > 97) {
                // cracked
                this.texture = randomChoice([RUTilesetSpriteSheet["ruins_floor_tile_5.png"],
                    RUTilesetSpriteSheet["ruins_floor_tile_8.png"],
                    RUTilesetSpriteSheet["ruins_floor_tile_11.png"]]);
            } else if (random > 82) {
                // noisy
                this.texture = randomChoice([RUTilesetSpriteSheet["ruins_floor_tile_4.png"],
                    RUTilesetSpriteSheet["ruins_floor_tile_7.png"],
                    RUTilesetSpriteSheet["ruins_floor_tile_10.png"]]);
            } else {
                // normal
                this.texture = randomChoice([RUTilesetSpriteSheet["ruins_floor_tile_3.png"],
                    RUTilesetSpriteSheet["ruins_floor_tile_6.png"],
                    RUTilesetSpriteSheet["ruins_floor_tile_9.png"]]);
            }
        } else if (Game.stage === STAGE.DRY_CAVE) {
            this.texture = randomChoice([DCTilesetSpriteSheet["dry_cave_floor_tile_0.png"],
                DCTilesetSpriteSheet["dry_cave_floor_tile_1.png"],
                DCTilesetSpriteSheet["dry_cave_floor_tile_2.png"],
                DCTilesetSpriteSheet["dry_cave_floor_tile_3.png"]]);
        } else if (Game.stage === STAGE.MARBLE_MAUSOLEUM) {
            this.texture = MMTilesetSpriteSheet["marble_floor_tile_0.png"];
        } else if (Game.stage === STAGE.IMP_BATTLE) {
            this.texture = randomChoice([Game.resources["src/images/tilesets/void_tileset/void_floor_tile_0.png"].texture,
                Game.resources["src/images/tilesets/void_tileset/void_floor_tile_1.png"].texture]);
            if (this.tilePosition.x <= 1 || this.tilePosition.y <= 1 || this.tilePosition.y >= Game.map.length - 2 || this.tilePosition.x >= Game.map[0].length - 2) {
                this.renderable = false;
            }
            //this.angle = randomChoice([0, 90, -90, 180]);
            //this.scale.x *= randomChoice([-1, 1]);

            if (this.tilePosition.x === 2 && this.tilePosition.y === 2
                || this.tilePosition.x === 2 && this.tilePosition.y === Game.map.length - 3
                || this.tilePosition.x === Game.map[0].length - 3 && this.tilePosition.y === 2
                || this.tilePosition.x === Game.map[0].length - 3 && this.tilePosition.y === Game.map.length - 3) {
                this.texture = randomChoice([Game.resources["src/images/tilesets/void_tileset/void_floor_tile_corner_0.png"].texture,
                    Game.resources["src/images/tilesets/void_tileset/void_floor_tile_corner_1.png"].texture]);
                if (this.tilePosition.x === Game.map[0].length - 3) this.scale.x *= -1;
                if (this.tilePosition.y === Game.map.length - 3) this.scale.y *= -1;
            } else if (this.tilePosition.x === 2 || this.tilePosition.x === Game.map[0].length - 3) {
                this.texture = randomChoice([Game.resources["src/images/tilesets/void_tileset/void_floor_tile_side_0.png"].texture,
                    Game.resources["src/images/tilesets/void_tileset/void_floor_tile_side_1.png"].texture]);
                if (this.tilePosition.x === Game.map[0].length - 3) this.scale.x *= -1;
            } else if (this.tilePosition.y === 2 || this.tilePosition.y === Game.map.length - 3) {
                this.texture = randomChoice([Game.resources["src/images/tilesets/void_tileset/void_floor_tile_up_0.png"].texture,
                    Game.resources["src/images/tilesets/void_tileset/void_floor_tile_up_1.png"].texture]);
                if (this.tilePosition.y === Game.map.length - 3) this.scale.y *= -1;
            }
        }
    }
}