import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class LeatherArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["leather_armor.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.id = EQUIPMENT_ID.LEATHER_ARMOR;
        this.name = "Leather Armor";
        this.description = "+0.5 defense";
        this.rarity = RARITY.C;
        this.passiveDef = 0.5;
    }
}