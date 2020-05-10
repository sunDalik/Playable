import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {ShieldsSpriteSheet} from "../../../loader";
import {AbstractShield} from "./abstract_shield";

export class Shield extends AbstractShield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["basic_shield.png"];
        this.type = SHIELD_TYPE.BASIC;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.uses = this.maxUses = 2;
        this.name = "Shield";
        this.description = "Automatically blocks incoming attacks";
        this.rarity = RARITY.C;
    }
}