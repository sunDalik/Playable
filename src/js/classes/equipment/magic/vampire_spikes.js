import {MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Spikes} from "./spikes";
import {createSpikeAnimation} from "../../../animations";

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


    createAttackAnimation(wielder, color = 0x3a497d, showRedSpikes = true) {
        if (showRedSpikes) {
            const redColor = 0xd15036;
            const sizeMul = 0.4;
            createSpikeAnimation(wielder, sizeMul, 0, redColor);
            createSpikeAnimation(wielder, -sizeMul, 0, redColor);
            createSpikeAnimation(wielder, 0, -sizeMul, redColor);
            createSpikeAnimation(wielder, 0, sizeMul, redColor);
        }

        super.createAttackAnimation(wielder, color);
    }
}

VampireSpikes.requiredMagic = Spikes;