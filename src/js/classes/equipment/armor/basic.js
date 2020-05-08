import {ARMOR_TYPE, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class BasicArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["basic.png"];
        this.type = ARMOR_TYPE.BASIC;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.name = "Basic Armor";
        this.description = "+0.5 defense";
        this.rarity = RARITY.C;
        this.def = 0.5;
    }
}