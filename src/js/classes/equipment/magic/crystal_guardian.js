import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {CrystalWind} from "./crystal_wind";

export class CrystalGuardian extends CrystalWind {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_crystal_guardian.png"];
        this.type = MAGIC_TYPE.CRYSTAL_GUARDIAN;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.uses = this.maxUses = 7;
        this.name = "Crystal Guardian";
        this.description = "EDIT";
        this.calculateRarity();
    }
}

CrystalGuardian.requiredMagic = CrystalWind;