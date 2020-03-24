import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";
import {ShieldsSpriteSheet} from "../../../loader";

export class StunningShield extends Shield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["stunning_shield.png"];
        this.type = SHIELD_TYPE.STUNNING;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.maxUses = 12;
        this.uses = this.maxUses;
        this.name = "Stunning Shield";
        this.description = "Activate to block all attacks and stun your opponents";
        this.rarity = RARITY.C;
    }

    onBlock(source, wielder, directHit) {
        if (directHit) {
            source.stun += 2;
        }
    }
}