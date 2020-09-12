import {TileElement} from "../../tile_elements/tile_element";
import {InanimatesSpriteSheet} from "../../../loader";
import {INANIMATE_TYPE, ROLE} from "../../../enums/enums";
import {dropItem} from "../../../game_logic";
import {Key} from "../../equipment/key";
import {getCardinalDirections} from "../../../utils/map_utils";
import {randomShuffle} from "../../../utils/random_utils";
import {isEmpty} from "../../../map_checks";

export class ShrineOfBalance extends TileElement {
    constructor(tilePositionX, tilePositionY, texture = InanimatesSpriteSheet["shrine_of_balance.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.SHRINE; //should it possible have shrineType?
        this.name = "Shrine of Balance";
        this.setScaleModifier(1.1);
        this.tallModifier = -8;
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

    onUpdate() {
    }
}