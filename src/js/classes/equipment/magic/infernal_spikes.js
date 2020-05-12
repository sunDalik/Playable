import {MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {VampireSpikes} from "./vampire_spikes";

InfernalSpikes.requiredMagic = VampireSpikes;

export class InfernalSpikes extends VampireSpikes {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_infernal_spikes.png"];
        this.type = MAGIC_TYPE.INFERNAL_SPIKES;
        this.uses = this.maxUses = 5;
        this.name = "Infernal Spikes";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {
    }
}