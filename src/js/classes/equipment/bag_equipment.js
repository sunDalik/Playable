import {EQUIPMENT_TYPE} from "../../enums/enums";
import {Equipment} from "./equipment";

export class BagEquipment extends Equipment {
    constructor() {
        super();
        this.equipmentType = EQUIPMENT_TYPE.BAG_ITEM;
        this.amount = 1;
    }

    useItem(wielder) {
        this.amount--;
    }
}