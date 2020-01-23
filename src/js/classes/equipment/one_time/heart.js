import {Game} from "../../../game"
import {EQUIPMENT_TYPE, ONE_TIME_ITEM_TYPE, RARITY} from "../../../enums";

//temporary name
//todo: come up with some unique name and texture and PLEASE
export class Heart {
    constructor() {
        this.texture = Game.resources["src/images/one_time/heart.png"].texture;
        this.type = ONE_TIME_ITEM_TYPE.HEART;
        this.equipmentType = EQUIPMENT_TYPE.ONE_TIME;
        this.name = "A heart";
        this.description = "Gain 1 heart container";
        this.rarity = RARITY.B;
    }

    useItem(player) {
        player.addHealthContainers(1);
    }
}