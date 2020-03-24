import {Game} from "../../../game"
import {EQUIPMENT_TYPE, ARMOR_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";

export class HeavyArmor {
    constructor() {
        this.texture = ArmorSpriteSheet["heavy.png"];
        this.type = ARMOR_TYPE.HEAVY;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.def = 2;
        this.magicPunishment = 0.25;
        this.name = "Heavy Armor";
        this.description = "+2 defense\nVulnerability to magic";
        this.rarity = RARITY.A;
    }

    onMagicCast(player) {
        player.damage(this.magicPunishment, null, false, false);
    }
}