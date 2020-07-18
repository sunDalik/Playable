import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {ShieldsSpriteSheet} from "../../../loader";
import {AbstractShield} from "./abstract_shield";

export class GoldenShield extends AbstractShield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["golden_shield.png"];
        this.id = EQUIPMENT_ID.GOLDEN_SHIELD;
        this.uses = this.maxUses = 6;
        this.name = "Golden Shield";
        this.description = "Automatically blocks incoming attacks";
        this.rarity = RARITY.S;
    }
}