import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {ForceShield} from "./force_shield";

export class AutoForceShield extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_auto_force_shield.png"];
        this.type = MAGIC_TYPE.AUTO_FORCE_SHIELD;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 0;
        this.uses = this.maxUses = 6;
        this.name = "Auto Force Shield";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {

    }
}

this.requiredMagic = ForceShield;