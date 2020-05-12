import {MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {VampireSpikes} from "./vampire_spikes";
import {createSpikeAnimation} from "../../../animations";

export class InfernalSpikes extends VampireSpikes {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_infernal_spikes.png"];
        this.type = MAGIC_TYPE.INFERNAL_SPIKES;
        this.uses = this.maxUses = 6;
        this.name = "Infernal Spikes";
        this.description = "EDIT";
        this.calculateRarity();
    }


    createAttackAnimation(wielder) {
        const redColor = 0xd15036;
        const spikes = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}];
        for (const spike of spikes) {
            createSpikeAnimation(wielder, spike.x, spike.y, redColor);
        }

        const sideMulDiff = 0.2;
        const sideMul = () => 0.4 + Math.random() * sideMulDiff * 2 - sideMulDiff;
        for (const spike of spikes.flatMap(s => [{x: s.x === 0 ? sideMul() : s.x, y: s.y === 0 ? sideMul() : s.y},
            {x: s.x === 0 ? -sideMul() : s.x, y: s.y === 0 ? -sideMul() : s.y}])) {
            createSpikeAnimation(wielder, spike.x, spike.y, redColor);
        }

        super.createAttackAnimation(wielder, 0x3a497d, false);
    }
}

InfernalSpikes.requiredMagic = VampireSpikes;