import {EQUIPMENT_ID, MAGIC_ALIGNMENT} from "../../../enums/enums";
import {MagicSpriteSheet} from "../../../loader";
import {Wind} from "./wind";

export class CrystalWind extends Wind {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_crystal_wind.png"];
        this.id = EQUIPMENT_ID.CRYSTAL_WIND;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.uses = this.maxUses = 6;
        this.crystal = true;
        this.name = "Crystal Wind";
        this.description = "Upgrade to Wind\nCan also destroy hazards and bullets around you";
        this.calculateRarity();
    }
}

CrystalWind.requiredMagic = Wind;