import {ARMOR_TYPE, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class BronzeArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["bronze_armor.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.type = ARMOR_TYPE.BRONZE;
        this.passiveDef = 1;
        this.name = "Bronze Armor";
        this.description = "+1 defense";
        this.rarity = RARITY.B;
    }
}