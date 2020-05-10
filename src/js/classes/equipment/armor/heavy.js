import {ARMOR_TYPE, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class HeavyArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["heavy.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.type = ARMOR_TYPE.HEAVY;
        this.def = 2;
        this.magicPunishment = 0.25;
        this.name = "Heavy Armor";
        this.description = "+2 defense\nYou take damage whenever you cast magic";
        this.rarity = RARITY.A;
    }

    onMagicCast(player) {
        player.damage(this.magicPunishment, null, false, false);
    }
}