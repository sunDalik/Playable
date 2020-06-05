import {ARMOR_TYPE, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class LeatherArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["leather_armor.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.type = ARMOR_TYPE.LEATHER;
        this.name = "Leather Armor";
        this.description = "+0.5 defense";
        this.rarity = RARITY.C;
        this.passiveDef = 0.5;
    }
}