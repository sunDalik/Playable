import {Equipment} from "./equipment";
import {EQUIPMENT_TYPE, RARITY} from "../../enums/enums";

export class Magic extends Equipment {
    constructor() {
        super();
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.magical = true;
    }

    cast(wielder) {}

    calculateRarity() {
        if (!this.constructor.requiredMagic) this.rarity = RARITY.C;
        else if (this.constructor.requiredMagic.requiredMagic) this.rarity = RARITY.S;
        else this.rarity = RARITY.A;
    }
}

Magic.requiredMagic = null;