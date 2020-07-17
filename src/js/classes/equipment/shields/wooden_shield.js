import {EQUIPMENT_ID, RARITY} from "../../../enums";
import {ShieldsSpriteSheet} from "../../../loader";
import {AbstractShield} from "./abstract_shield";

export class WoodenShield extends AbstractShield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["basic_shield.png"];
        this.id = EQUIPMENT_ID.WOODEN_SHIELD;
        this.uses = this.maxUses = 2;
        this.name = "Wooden Shield";
        this.description = "Automatically blocks incoming attacks";
        this.rarity = RARITY.C;
    }
}