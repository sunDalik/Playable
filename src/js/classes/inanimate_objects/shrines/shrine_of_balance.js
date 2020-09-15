import {InanimatesSpriteSheet} from "../../../loader";
import {Key} from "../../equipment/key";
import {Shrine} from "./shrine";

export class ShrineOfBalance extends Shrine {
    constructor(tilePositionX, tilePositionY, texture = InanimatesSpriteSheet["shrine_of_balance.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Shrine of Balance";
        this.description = "Lose 1 HP\nGain 1 Key";
    }

    interact(player) {
        player.voluntaryDamage(1, this, true);
        this.dropItemOnFreeTile(new Key());
        this.successfullyActivate();
    }
}