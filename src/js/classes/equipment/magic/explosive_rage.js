import {EQUIPMENT_ID, MAGIC_ALIGNMENT} from "../../../enums/enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {explode} from "../../../game_logic";

export class ExplosiveRage extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["explosive_rage.png"];
        this.id = EQUIPMENT_ID.EXPLOSIVE_RAGE;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 3;
        this.uses = this.maxUses = 5;
        this.bombImmunity = true;
        this.name = "Explosive Rage";
        this.description = "Create instant explosion on your tile that deals 3 dmg to enemies and 1 dmg to players\nGain permanent bomb immunity";
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        explode(wielder.tilePosition.x, wielder.tilePosition.y, this.atk, 1);
        this.uses--;
        return true;
    }
}