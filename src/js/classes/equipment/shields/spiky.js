import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";

export class SpikyShield extends Shield {
    constructor() {
        super();
        this.texture = Game.resources["src/images/shields/spiky.png"].texture;
        this.type = SHIELD_TYPE.SPIKY;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.shieldAtk = 1;
        this.maxUses = 12;
        this.uses = this.maxUses;
        this.name = "Spiky Shield";
        this.description = "Activate to block all attacks and hurt your opponents";
        this.rarity = RARITY.B;
    }

    onBlock(source, wielder, directHit) {
        if (this.uses <= 0) return false;
        if (directHit) {
            source.damage(wielder, this.shieldAtk, 0, 0, false);
        }
        return true;
    }
}