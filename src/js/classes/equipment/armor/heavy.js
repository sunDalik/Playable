import {Game} from "../../../game"
import {EQUIPMENT_TYPE, ARMOR_TYPE, RARITY} from "../../../enums";

export class HeavyArmor {
    constructor() {
        this.texture = Game.resources["src/images/armor/heavy.png"].texture;
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