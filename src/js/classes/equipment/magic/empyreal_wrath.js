import {MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Thunderstorm} from "./thunderstorm";

export class EmpyrealWrath extends Thunderstorm {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_empyreal_wrath.png"];
        this.type = MAGIC_TYPE.EMPYREAL_WRATH;
        this.uses = this.maxUses = 6;
        this.name = "Empyreal Wrath";
        this.description = `EDIT`;
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;

        this.uses--;
        return true;
    }
}

EmpyrealWrath.requiredMagic = Thunderstorm;