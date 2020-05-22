import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {CrystalWind} from "./crystal_wind";

export class CrystalGuardian extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_crystal_guardian.png"];
        this.type = MAGIC_TYPE.CRYSTAL_GUARDIAN;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.uses = this.maxUses = 6;
        this.name = "Crystal Guardian";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {

    }
}

CrystalGuardian.requiredMagic = CrystalWind;