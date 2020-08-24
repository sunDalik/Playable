import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class ElectricArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["electric.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.id = EQUIPMENT_ID.ELECTRIC_ARMOR;
        this.passiveDef = 0.5;
        this.passiveAtk = 0.5;
        this.name = "Electric Armor";
        this.description = "+0.5 defense\n+0.5 attack\nTake half damage from electric bullets";
        this.rarity = RARITY.B;
        this.electricityImmunity = true;
    }
}