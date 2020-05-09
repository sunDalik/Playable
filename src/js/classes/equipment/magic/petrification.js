import {Game} from "../../../game";
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class Petrification extends Magic{
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_petrification.png"];
        this.type = MAGIC_TYPE.PETRIFICATION;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 0;
        this.uses = this.maxUses = 4;
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