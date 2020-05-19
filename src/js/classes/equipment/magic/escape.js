import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {ForceShield} from "./force_shield";

export class Escape extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_escape.png"];
        this.type = MAGIC_TYPE.ESCAPE;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.uses = this.maxUses = 6;
        this.name = "Escape";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {

    }
}