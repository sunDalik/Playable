import {Equipment} from "./equipment";
import {EQUIPMENT_TYPE} from "../../enums";

export class Magic extends Equipment {
    constructor() {
        super();
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.magical = true;
    }

    cast(wielder) {}
}