import {MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {Wind} from "./wind";

export class CrystalWind extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_crystal_wind.png"];
        this.type = MAGIC_TYPE.CRYSTAL_WIND;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.uses = this.maxUses = 5;
        this.name = "Crystal Wind";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {

    }
}

CrystalWind.requiredMagic = Wind;