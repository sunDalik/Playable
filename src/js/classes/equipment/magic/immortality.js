import {EQUIPMENT_ID, MAGIC_ALIGNMENT} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class Immortality extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_immortality.png"];
        this.id = EQUIPMENT_ID.IMMORTALITY;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.name = "Immortality";
        this.description = "Gain 1 heart container";
        this.used = false;
        this.calculateRarity();
    }

    cast() {
        return false;
    }

    onWear(wielder) {
        if (!this.used) {
            this.used = true;
            wielder.addHealthContainers(1);
        }
    }
}