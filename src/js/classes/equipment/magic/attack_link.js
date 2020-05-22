import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class AttackLink extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_attack_link.png"];
        this.type = MAGIC_TYPE.ATTACK_LINK;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.name = "Attack Link";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {
        return false;
    }
}