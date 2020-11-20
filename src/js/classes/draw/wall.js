import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import {STAGE, TILE_TYPE} from "../../enums/enums";
import {randomChoice} from "../../utils/random_utils";
import {
    DCTilesetSpriteSheet,
    DTTilesetSpriteSheet,
    FCTilesetSpriteSheet,
    MMTilesetSpriteSheet,
    RUTilesetSpriteSheet
} from "../../loader";
import {isNotOutOfMap, isOutOfMap} from "../../map_checks";
import {getCardinalDirections} from "../../utils/map_utils";

export let wallTallness = 0;

export class WallTile extends TileElement {
    constructor(tilePositionX, tilePositionY, texture = FCTilesetSpriteSheet["flooded_cave_walls_0.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.setOwnZIndex(Z_INDEXES.WALL);
        this.setTexture();
        this.setScaleModifier(1.02);
        if (wallTallness === 0) wallTallness = 128 * this.scale.y * 1.01; // in theory it might initialize AFTER someone will need it... keep it in mind
        this.trueWallPlacement = true;
        this.place();
    }

    setTexture() {
        const random = Math.random() * 100;
        if (Game.stage === STAGE.FLOODED_CAVE) {
            if (random > 93) {
                //noisy
                this.texture = randomChoice([FCTilesetSpriteSheet["flooded_cave_walls_6.png"],
                    FCTilesetSpriteSheet["flooded_cave_walls_7.png"],
                    FCTilesetSpriteSheet["flooded_cave_walls_8.png"]]);
            } else {
                //normal
                this.texture = randomChoice([FCTilesetSpriteSheet["flooded_cave_walls_0.png"],
                    FCTilesetSpriteSheet["flooded_cave_walls_1.png"],
                    FCTilesetSpriteSheet["flooded_cave_walls_2.png"],
                    FCTilesetSpriteSheet["flooded_cave_walls_3.png"],
                    FCTilesetSpriteSheet["flooded_cave_walls_4.png"],
                    FCTilesetSpriteSheet["flooded_cave_walls_5.png"]]);
            }
        } else if (Game.stage === STAGE.DARK_TUNNEL) {
            if (random > 98) {
                //cracked
                this.texture = DTTilesetSpriteSheet["dark_tunnel_walls_5.png"];
            } else if (random > 94) {
                //noisy
                this.texture = DTTilesetSpriteSheet["dark_tunnel_walls_6.png"];
            } else if (random > 88) {
                // lava
                this.texture = randomChoice([DTTilesetSpriteSheet["dark_tunnel_walls_7.png"],
                    DTTilesetSpriteSheet["dark_tunnel_walls_8.png"]]);
            } else {
                // normal
                this.texture = randomChoice([DTTilesetSpriteSheet["dark_tunnel_walls_0.png"],
                    DTTilesetSpriteSheet["dark_tunnel_walls_1.png"],
                    DTTilesetSpriteSheet["dark_tunnel_walls_2.png"],
                    DTTilesetSpriteSheet["dark_tunnel_walls_3.png"],
                    DTTilesetSpriteSheet["dark_tunnel_walls_4.png"]]);
            }
        } else if (Game.stage === STAGE.RUINS) {
            if (random > 99) {
                // cracked
                this.texture = RUTilesetSpriteSheet["ruins_walls_9.png"];
            } else if (random > 97) {
                // broken + indented
                this.texture = RUTilesetSpriteSheet["ruins_walls_4.png"];
            } else if (random > 90) {
                // broken
                this.texture = randomChoice([RUTilesetSpriteSheet["ruins_walls_3.png"],
                    RUTilesetSpriteSheet["ruins_walls_5.png"]]);
            } else if (random > 75) {
                // extruded bricks
                this.texture = randomChoice([RUTilesetSpriteSheet["ruins_walls_7.png"],
                    RUTilesetSpriteSheet["ruins_walls_10.png"]]);
            } else {
                // normal
                this.texture = randomChoice([RUTilesetSpriteSheet["ruins_walls_2.png"],
                    RUTilesetSpriteSheet["ruins_walls_6.png"],
                    RUTilesetSpriteSheet["ruins_walls_8.png"]]);
            }
        } else if (Game.stage === STAGE.DRY_CAVE) {
            if (random > 85) {
                // holes
                this.texture = randomChoice([DCTilesetSpriteSheet["dry_cave_walls_4.png"],
                    DCTilesetSpriteSheet["dry_cave_walls_6.png"],
                    DCTilesetSpriteSheet["dry_cave_walls_7.png"],
                    DCTilesetSpriteSheet["dry_cave_walls_8.png"]]);
            } else {
                // normal
                this.texture = randomChoice([DCTilesetSpriteSheet["dry_cave_walls_0.png"],
                    DCTilesetSpriteSheet["dry_cave_walls_1.png"],
                    DCTilesetSpriteSheet["dry_cave_walls_2.png"],
                    DCTilesetSpriteSheet["dry_cave_walls_3.png"],
                    DCTilesetSpriteSheet["dry_cave_walls_5.png"]]);
            }
        } else if (Game.stage === STAGE.MARBLE_MAUSOLEUM) {
            this.texture = randomChoice([MMTilesetSpriteSheet["marble_wall_0.png"]]);
        }
    }


    correctZIndex() {
        this.zIndex = getZIndexForLayer(this.tilePosition.y, true) + this.ownZIndex;
    }

    getTilePositionY() {
        if (this.trueWallPlacement) {
            return Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
        } else {
            return super.getTilePositionY();
        }
    }

    afterMapGen() {
        let freeDown = false;
        if (isNotOutOfMap(this.tilePosition.x, this.tilePosition.y + 1) && Game.map[this.tilePosition.y + 1][this.tilePosition.x].tileType === TILE_TYPE.NONE) {
            freeDown = true;
        }

        let free4 = true;
        for (let dir of getCardinalDirections()) {
            if (isOutOfMap(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) || Game.map[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].tileType !== TILE_TYPE.NONE) {
                free4 = false;
            }
        }

        if (Game.stage === STAGE.MARBLE_MAUSOLEUM) {
            if (free4) {
                // todo make pillars and stuff a separate thing from walls?
                // pillar
                this.texture = randomChoice([MMTilesetSpriteSheet["marble_pillar.png"]]);
                this.trueWallPlacement = false;
                this.tallModifier = -5;
                this.place();
            } else if (freeDown && Math.random() < 0.15) {
                //todo check that neighbor walls dont have banner
                // red banner
                this.texture = randomChoice([MMTilesetSpriteSheet["marble_wall_1.png"]]);
            }
        }
    }
}