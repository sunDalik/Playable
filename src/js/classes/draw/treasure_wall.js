import {Game} from "../../game";
import {STAGE} from "../../enums/enums";
import {WallsSpriteSheet} from "../../loader";
import {randomChoice} from "../../utils/random_utils";
import {WallTile} from "./wall";
import {dropItem} from "../../game_logic";
import {Key} from "../equipment/key";
import {Chest} from "../inanimate_objects/chest";
import {HealingPotion} from "../equipment/bag/healing_potion";

export class TreasureWallTile extends WallTile {
    constructor(tilePositionX, tilePositionY, texture = WallsSpriteSheet["flooded_cave_walls_treasure_0.png"]) {
        super(tilePositionX, tilePositionY, texture);
    }

    setTexture() {
        if (Game.stage === STAGE.FLOODED_CAVE) {
            this.texture = randomChoice([WallsSpriteSheet["flooded_cave_walls_treasure_0.png"],
                WallsSpriteSheet["flooded_cave_walls_treasure_4.png"]]);
        } else if (Game.stage === STAGE.DARK_TUNNEL) {
            this.texture = randomChoice([WallsSpriteSheet["dark_tunnel_walls_treasure_2.png"],
                WallsSpriteSheet["dark_tunnel_walls_treasure_7.png"]]);
        } else if (Game.stage === STAGE.RUINS) {
            this.texture = randomChoice([WallsSpriteSheet["ruins_walls_treasure_3.png"],
                WallsSpriteSheet["ruins_walls_treasure_6.png"]]);
        }
    }

    onTileDestroy() {
        const random = Math.random() * 100;
        if (random > 98) {
            dropItem(new HealingPotion(), this.tilePosition.x, this.tilePosition.y);
        } else if (random > 90) {
            Game.world.addInanimate(new Chest(this.tilePosition.x, this.tilePosition.y));
        } else {
            dropItem(new Key(), this.tilePosition.x, this.tilePosition.y);
        }
    }
}