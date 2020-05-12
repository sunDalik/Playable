import {MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Spikes} from "./spikes";

VampireSpikes.requiredMagic = Spikes;

export class VampireSpikes extends Spikes {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_vampire_spikes.png"];
        this.type = MAGIC_TYPE.VAMPIRE_SPIKES;
        this.uses = this.maxUses = 5;
        this.name = "Vampire Spikes";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {
    }
}