import {MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {VampireSpikes} from "./vampire_spikes";
import {createCrazySpikeAnimation, shakeScreen} from "../../../animations";

export class InfernalSpikes extends VampireSpikes {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_infernal_spikes.png"];
        this.type = MAGIC_TYPE.INFERNAL_SPIKES;
        this.uses = this.maxUses = 6;
        this.name = "Infernal Spikes";
        this.description = "Upgrade to Vampire Spikes\nYou now cast both diagonal and cardinal spikes";
        this.attackDirs = this.attackDirs.concat([{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}]);
        this.calculateRarity();
    }

    cast(wielder) {
        if (super.cast(wielder)) {
            shakeScreen(8, 5);
        }
    }

    createAttackAnimation(wielder) {
        const redColor = 0xd15036;
        const spikes = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}];
        for (const spike of spikes) {
            createCrazySpikeAnimation(wielder, spike.x, spike.y, redColor, true);
        }

        const sideMulDiff = 0.2;
        const sideMul = () => 0.4 + Math.random() * sideMulDiff * 2 - sideMulDiff;
        for (const spike of spikes.flatMap(s => [{x: s.x === 0 ? sideMul() : s.x, y: s.y === 0 ? sideMul() : s.y},
            {x: s.x === 0 ? -sideMul() : s.x, y: s.y === 0 ? -sideMul() : s.y}])) {
            createCrazySpikeAnimation(wielder, spike.x, spike.y, redColor, true);
        }

        super.createAttackAnimation(wielder, 0x3a497d, false);
    }
}

InfernalSpikes.requiredMagic = VampireSpikes;