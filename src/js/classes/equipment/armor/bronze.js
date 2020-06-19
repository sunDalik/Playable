import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class BronzeArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["bronze_armor.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.id = EQUIPMENT_ID.BRONZE_ARMOR;
        this.passiveDef = 1;
        this.name = "Bronze Armor";
        this.description = "+1 defense";
        this.rarity = RARITY.B;
    }
}