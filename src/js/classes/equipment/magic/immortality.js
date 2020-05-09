import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

//maybe not active...?
export class Immortality extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_immortality.png"];
        this.type = MAGIC_TYPE.IMMORTALITY;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.name = "Immortality";
        this.description = "Gain 2 heart containers";
        this.rarity = RARITY.C;
        this.used = false;
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