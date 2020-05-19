import {MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {Wind} from "./wind";

export class ForceShield extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_force_shield.png"];
        this.type = MAGIC_TYPE.FORCE_SHIELD;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 0;
        this.uses = this.maxUses = 5;
        this.name = "Force Shield";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {

    }
}

this.requiredMagic = Wind;