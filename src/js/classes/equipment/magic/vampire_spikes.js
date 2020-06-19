import {EQUIPMENT_ID} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Spikes} from "./spikes";
import {createCrazySpikeAnimation} from "../../../animations";

export class VampireSpikes extends Spikes {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_vampire_spikes.png"];
        this.id = EQUIPMENT_ID.VAMPIRE_SPIKES;
        this.uses = this.maxUses = 5;
        this.name = "Vampire Spikes";
        this.description = "Upgrade to Spikes\nYou heal 1 HP for every 2 enemies damaged with spikes\nYou also heal 1 HP if you damage your ally";
        this.calculateRarity();
    }

    createAttackAnimation(wielder, color = 0x3a497d, showRedSpikes = true) {
        if (showRedSpikes) {
            const redColor = 0xd15036;
            const sizeMul = 0.4;
            createCrazySpikeAnimation(wielder, sizeMul, 0, redColor, true);
            createCrazySpikeAnimation(wielder, -sizeMul, 0, redColor, true);
            createCrazySpikeAnimation(wielder, 0, -sizeMul, redColor, true);
            createCrazySpikeAnimation(wielder, 0, sizeMul, redColor, true);
        }

        super.createAttackAnimation(wielder, color);
    }

    attackEffect(wielder, enemiesDamaged, playerDamaged) {
        wielder.heal(Math.floor(enemiesDamaged / 2));
        if (playerDamaged) wielder.heal(1);
    }
}

VampireSpikes.requiredMagic = Spikes;