import {ARMOR_TYPE, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class ElectricArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["electric.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.type = ARMOR_TYPE.ELECTRIC;
        this.def = 0.25;
        this.atk = 0.25;
        this.name = "Electric Armor";
        this.description = "+0.25 attack\n+0.25 defense\nTake half damage from electric bullets";
        this.rarity = RARITY.B;
        this.electricityImmunity = true;
    }
}