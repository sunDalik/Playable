import {MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Light} from "./light";

export class SunBlessing extends Light {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_sun_blessing.png"];
        this.type = MAGIC_TYPE.SUN_BLESSING;
        this.uses = this.maxUses = 8;
        this.name = "Sun's Blessing";
        this.description = "EDIT";
        this.calculateRarity();
    }

    onWear(wielder) {
        super.onWear(wielder);
        wielder.linkedHealing++;
    }

    onTakeOff(wielder) {
        super.onTakeOff(wielder);
        wielder.linkedHealing--;
    }
}

SunBlessing.requiredMagic = Light;