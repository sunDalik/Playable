import {Game} from "../../../game"
import {EQUIPMENT_TYPE, ARMOR_TYPE} from "../../../enums";

export class BasicArmor {
    constructor() {
        this.texture = Game.resources["src/images/armor/basic.png"].texture;
        this.type = ARMOR_TYPE.BASIC;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.def = 0.5;
    }
}