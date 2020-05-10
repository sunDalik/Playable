import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {ShieldsSpriteSheet} from "../../../loader";
import {AbstractShield} from "./abstract_shield";

export class GoldenShield extends AbstractShield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["golden_shield.png"];
        this.type = SHIELD_TYPE.GOLDEN;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.uses = this.maxUses = 6;
        this.name = "Golden Shield";
        this.description = "Automatically blocks incoming attacks";
        this.rarity = RARITY.S;
    }
}