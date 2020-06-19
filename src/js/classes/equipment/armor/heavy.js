import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class HeavyArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["heavy.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.id = EQUIPMENT_ID.HEAVY_ARMOR;
        this.passiveDef = 2;
        this.magicPunishment = 0.25;
        this.name = "Heavy Armor";
        this.description = "+2 defense\nYou take 0.25 damage whenever you cast magic";
        this.rarity = RARITY.A;
    }

    onMagicCast(player) {
        player.damage(this.magicPunishment, null, false, false);
    }
}