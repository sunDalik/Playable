import {MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Light} from "./light";

export class SunBlessing extends Light {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_sun_blessing.png"];
        this.type = MAGIC_TYPE.SUN_BLESSING;
        this.uses = this.maxUses = 7;
        this.name = "Sun's Blessing";
        this.description = "Upgrade to Light\nProvides linked healing: whenever any character gets healed in any way, other character gets healed by the same amount";
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