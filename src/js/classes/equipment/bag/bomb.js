import {Game} from "../../../game"
import {BAG_ITEM_TYPE, EQUIPMENT_TYPE} from "../../../enums";

export class Bomb {
    constructor() {
        this.texture = Game.resources["src/images/bag/bomb.png"].texture;
        this.type = BAG_ITEM_TYPE.BOMB;
        this.equipmentType = EQUIPMENT_TYPE.BAG_ITEM;
        this.name = "Bomb";
        this.description = "Explode";
    }

    useItem() {

    }
}