import {Game} from "../../../game"
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY,} from "../../../enums";

export class Immortality {
    constructor() {
        this.texture = Game.resources["src/images/magic/immortality.png"].texture;
        this.type = MAGIC_TYPE.IMMORTALITY;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 0;
        this.maxUses = 0;
        this.uses = 0;
        this.infinite = true;
        this.passive = true;
        this.name = "Immortality";
        this.description = "Gain 2 heart containers";
        this.rarity = RARITY.C;
        this.used = false;
    }

    cast(wielder) {
        return false;
    }

    onWear(wielder) {
        if (!this.used) {
            this.used = true;
            wielder.addHealthContainers(2);
        }
    }
}