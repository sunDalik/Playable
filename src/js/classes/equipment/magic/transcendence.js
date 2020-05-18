import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {Immortality} from "./immortality";

export class Transcendence extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_transcendence.png"];
        this.type = MAGIC_TYPE.TRANSCENDENCE;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.name = "Transcendence";
        this.description = "Upgrade to Immortality\nGain 2 more heart containers";
        this.used = false;
        this.calculateRarity();
    }

    cast() {
        return false;
    }

    onWear(wielder) {
        if (!this.used) {
            this.used = true;
            wielder.addHealthContainers(2);
        }
    }
}

Transcendence.requiredMagic = Immortality;