import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {ShieldsSpriteSheet} from "../../../loader";
import {AbstractShield} from "./abstract_shield";

export class StunningShield extends AbstractShield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["stunning_shield.png"];
        this.type = SHIELD_TYPE.STUNNING;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.uses = this.maxUses = 3;
        this.name = "Stunning Shield";
        this.description = "Blocking attacks stuns enemies";
        this.rarity = RARITY.B;
    }

    onBlock(source, wielder, directHit) {
        if (directHit) {
            source.stun += 3;
        }
    }
}