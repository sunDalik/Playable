import {Game} from "../../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT, EQUIPMENT_TYPE, RARITY,} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";

export class Petrification {
    constructor() {
        this.texture = MagicSpriteSheet["petrification.png"];
        this.type = MAGIC_TYPE.PETRIFICATION;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 0;
        this.maxUses = 4;
        this.uses = this.maxUses;
        this.name = "Petrification";
        this.description = "Petrify all enemies";
        this.rarity = RARITY.C;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (const enemy of Game.enemies) {
            if (enemy.visible) enemy.stun += 9;
        }
        this.uses--;
        return true;
    }
}