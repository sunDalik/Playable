import {Game} from "../../../game"
import {EQUIPMENT_TYPE, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";

export class StunningShield extends Shield {
    constructor() {
        super();
        this.texture = Game.resources["src/images/shields/stunning.png"].texture;
        this.type = SHIELD_TYPE.STUNNING;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.maxUses = 6;
        this.uses = this.maxUses;
    }

    onBlock(source, wielder, directHit) {
        if (directHit) {
            source.stun += 2;
        }
    }
}