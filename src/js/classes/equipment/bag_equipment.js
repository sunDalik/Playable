import {ActiveEquipment} from "./active_equipment";
import {EQUIPMENT_TYPE} from "../../enums";

export class BagEquipment extends ActiveEquipment {
    constructor() {
        super();
        this.equipmentType = EQUIPMENT_TYPE.BAG_ITEM;
        this.amount = 1;
    }

    set amount(value) {
        this.uses = value;
    }

    get amount() {
        return this.uses;
    }

    useItem() {
        this.amount--;
    }
}