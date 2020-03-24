import {Game} from "../../../game"
import {EQUIPMENT_TYPE, ARMOR_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";

export class ElectricArmor {
    constructor() {
        this.texture = ArmorSpriteSheet["electric.png"];
        this.type = ARMOR_TYPE.ELECTRIC;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.def = 0.25;
        this.atk = 0.25;
        this.name = "Electric Armor";
        this.description = "+0.25 atk, +0.25 def\nTake half damage from electricity";
        this.rarity = RARITY.B;
    }

    onWear(wielder) {
        wielder.electricityImmunity++;
    }

    onTakeOff(wielder) {
        wielder.electricityImmunity--;
    }
}