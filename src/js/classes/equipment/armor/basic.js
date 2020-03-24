import {Game} from "../../../game"
import {EQUIPMENT_TYPE, ARMOR_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";

export class BasicArmor {
    constructor() {
        this.texture = ArmorSpriteSheet["basic.png"];
        this.type = ARMOR_TYPE.BASIC;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.name = "Basic Armor";
        this.description = "+0.5 defense";
        this.rarity = RARITY.C;
        this.def = 0.5;
    }
}