import {InanimatesSpriteSheet} from "../../../loader";
import {dropItem} from "../../../game_logic";
import {Key} from "../../equipment/key";
import {getCardinalDirections} from "../../../utils/map_utils";
import {randomShuffle} from "../../../utils/random_utils";
import {isEmpty} from "../../../map_checks";
import {Shrine} from "./shrine";

export class ShrineOfBalance extends Shrine {
    constructor(tilePositionX, tilePositionY, texture = InanimatesSpriteSheet["shrine_of_balance.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Shrine of Balance";
        this.description = "Lose 1 HP\nGain 1 Key";
    }

    interact(player) {
        player.voluntaryDamage(1, this, true);
        let droppedKey = false;
        for (const dir of randomShuffle(getCardinalDirections())) {
            const tile = {x: this.tilePosition.x + dir.x, y: this.tilePosition.y + dir.y};
            if (isEmpty(tile.x, tile.y)) {
                dropItem(new Key(), tile.x, tile.y);
                droppedKey = true;
                break;
            }
        }

        if (!droppedKey) {
            dropItem(new Key(), this.tilePosition.x, this.tilePosition.y);
        }
    }
}