import {ARMOR_TYPE, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class ElectricArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["electric.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.type = ARMOR_TYPE.ELECTRIC;
        this.passiveDef = 0.5;
        this.passiveAtk = 0.25;
        this.name = "Electric Armor";
        this.description = "+0.5 defense\n+0.25 attack\nTake half damage from electric bullets";
        this.rarity = RARITY.B;
        this.electricityImmunity = true;
    }
}