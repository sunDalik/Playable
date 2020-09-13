import {InanimatesSpriteSheet} from "../../../loader";
import {Shrine} from "./shrine";
import {RerollPotion} from "../../equipment/bag/reroll_potion";
import {addKeys} from "../../../game_logic";
import {Game} from "../../../game";
import {createFadingText} from "../../../animations";

export class ShrineOfDice extends Shrine {
    constructor(tilePositionX, tilePositionY, texture = InanimatesSpriteSheet["shrine_of_dice.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Shrine of Dice";
        this.description = "Pay 1 Key\nGet 1 Reroll Potion";
    }

    interact(player) {
        if (Game.keysAmount > 0) {
            addKeys(-1);
            this.dropItemOnFreeTile(new RerollPotion());
        } else {
            createFadingText("You have no keys", this.position.x, this.position.y);
        }
    }
}