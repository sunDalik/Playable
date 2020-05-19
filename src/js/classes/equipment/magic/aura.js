import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {Light} from "./light";

export class Aura extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_aura.png"];
        this.type = MAGIC_TYPE.AURA;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.uses = this.maxUses = 6;
        this.name = "Aura";
        this.description = "EDIT";
        this.calculateRarity();
    }
}

Aura.requiredMagic = Light;