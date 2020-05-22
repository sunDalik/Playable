import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class Thunderstorm extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_thunderstorm.png"];
        this.type = MAGIC_TYPE.THUNDERSTORM;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 1;
        this.uses = this.maxUses = 5;
        this.name = "Thunderstorm";
        this.description = `EDIT`;
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;

        this.uses--;
        return true;
    }
}