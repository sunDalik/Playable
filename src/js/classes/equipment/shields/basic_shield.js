import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";
import {ShieldsSpriteSheet} from "../../../loader";

export class BasicShield extends Shield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["basic_shield.png"];
        this.type = SHIELD_TYPE.BASIC;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.maxUses = 20;
        this.uses = this.maxUses;
        this.name = "Shield";
        this.description = "Activate to block all attacks";
        this.rarity = RARITY.C;
    }
}