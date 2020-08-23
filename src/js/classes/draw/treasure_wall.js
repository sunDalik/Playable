import {Game} from "../../game";
import {ACHIEVEMENT_ID, STAGE} from "../../enums/enums";
import {randomChoice} from "../../utils/random_utils";
import {WallTile} from "./wall";
import {dropItem} from "../../game_logic";
import {Key} from "../equipment/key";
import {Chest} from "../inanimate_objects/chest";
import {HealingPotion} from "../equipment/bag/healing_potion";
import {RerollPotion} from "../equipment/bag/reroll_potion";
import {completeAchievement} from "../../achievements";
import {DCTilesetSpriteSheet, DTTilesetSpriteSheet, FCTilesetSpriteSheet, RUTilesetSpriteSheet} from "../../loader";
import {redrawMiniMapPixel} from "../../drawing/minimap";

export class TreasureWallTile extends WallTile {
    constructor(tilePositionX, tilePositionY, texture = FCTilesetSpriteSheet["flooded_cave_walls_treasure_0.png"]) {
        super(tilePositionX, tilePositionY, texture);
    }

    setTexture() {
        if (Game.stage === STAGE.FLOODED_CAVE) {
            this.texture = randomChoice([FCTilesetSpriteSheet["flooded_cave_walls_treasure_0.png"],
                FCTilesetSpriteSheet["flooded_cave_walls_treasure_4.png"]]);
        } else if (Game.stage === STAGE.DARK_TUNNEL) {
            this.texture = randomChoice([DTTilesetSpriteSheet["dark_tunnel_walls_treasure_2.png"],
                DTTilesetSpriteSheet["dark_tunnel_walls_treasure_7.png"]]);
        } else if (Game.stage === STAGE.RUINS) {
            this.texture = randomChoice([RUTilesetSpriteSheet["ruins_walls_treasure_3.png"],
                RUTilesetSpriteSheet["ruins_walls_treasure_6.png"]]);
        } else if (Game.stage === STAGE.DRY_CAVE) {
            this.texture = randomChoice([DCTilesetSpriteSheet["dry_cave_treasure_wall_0.png"],
                DCTilesetSpriteSheet["dry_cave_treasure_wall_1.png"]]);
        }
    }

    onTileDestroy() {
        completeAchievement(ACHIEVEMENT_ID.EXPLODE_TREASURE_WALL);
        const random = Math.random() * 100;
        if (random > 99.5) {
            dropItem(new RerollPotion(), this.tilePosition.x, this.tilePosition.y);
        } else if (random > 97) {
            dropItem(new HealingPotion(), this.tilePosition.x, this.tilePosition.y);
        } else if (random > 84) {
            Game.world.addInanimate(new Chest(this.tilePosition.x, this.tilePosition.y));
            redrawMiniMapPixel(this.tilePosition.x, this.tilePosition.y);
        } else {
            dropItem(new Key(), this.tilePosition.x, this.tilePosition.y);
        }
    }
}