import {Game} from "../../../game"
import {EQUIPMENT_TYPE, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";

export class SpikyShield extends Shield {
    constructor() {
        super();
        this.texture = Game.resources["src/images/shields/spiky.png"].texture;
        this.type = SHIELD_TYPE.SPIKY;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.shieldAtk = 1;
        this.maxUses = 6;
        this.uses = this.maxUses;
    }

    onBlock(source, wielder, directHit) {
        if (directHit) {
            source.damage(wielder, this.shieldAtk, 0, 0, false);
        }
    }
}