import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Wind} from "./wind";

export class CrystalWind extends Wind {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_crystal_wind.png"];
        this.type = MAGIC_TYPE.CRYSTAL_WIND;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.uses = this.maxUses = 6;
        this.crystal = true;
        this.name = "Crystal Wind";
        this.description = "EDIT";
        this.calculateRarity();
    }
}

CrystalWind.requiredMagic = Wind;