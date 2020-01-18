import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";

export class StunningShield extends Shield {
    constructor() {
        super();
        this.texture = Game.resources["src/images/shields/stunning.png"].texture;
        this.type = SHIELD_TYPE.STUNNING;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.maxUses = 6;
        this.uses = this.maxUses;
        this.name = "Stunning Shield";
        this.description = "Activate to block all damage and stun your opponents";
        this.rarity = RARITY.C;
    }

    onBlock(source, wielder, directHit) {
        if (this.uses <= 0) return false;
        if (directHit) {
            source.stun += 2;
        }
        return true;
    }
}