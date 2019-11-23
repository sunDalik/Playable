import {Game} from "../../../game"
import {EQUIPMENT_TYPE, ARMOR_TYPE} from "../../../enums";

export class ElectricArmor {
    constructor() {
        this.texture = Game.resources["src/images/armor/electric.png"].texture;
        this.type = ARMOR_TYPE.ELECTRIC;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.def = 0.25;
        this.atk = 0.25;
    }
}