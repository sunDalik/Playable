import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class DefenseLink extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_defense_link.png"];
        this.type = MAGIC_TYPE.DEFENSE_LINK;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.name = "Defense Link";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {
        return false;
    }
}