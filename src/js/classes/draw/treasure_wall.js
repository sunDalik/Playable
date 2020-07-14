import {Game} from "../../game";
import {STAGE} from "../../enums";
import {WallsSpriteSheet} from "../../loader";
import {randomChoice} from "../../utils/random_utils";
import {WallTile} from "./wall";

export class TreasureWallTile extends WallTile {
    constructor(tilePositionX, tilePositionY, texture = WallsSpriteSheet["flooded_cave_walls_treasure_0.png"]) {
        super(tilePositionX, tilePositionY, texture);
    }

    setTexture() {
        if (Game.stage === STAGE.FLOODED_CAVE) {
            this.texture = randomChoice([WallsSpriteSheet["flooded_cave_walls_treasure_0.png"],
                WallsSpriteSheet["flooded_cave_walls_treasure_4.png"]]);
        } else if (Game.stage === STAGE.DARK_TUNNEL) {

        } else if (Game.stage === STAGE.RUINS) {

        }
    }
}