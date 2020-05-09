import {EQUIPMENT_TYPE} from "../../enums";
import {Equipment} from "./equipment";

export class BagEquipment extends Equipment {
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