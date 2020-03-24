import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";
import {ShieldsSpriteSheet} from "../../../loader";

export class SpikyShield extends Shield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["spiky_shield.png"];
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
        if (directHit) {
            source.damage(wielder, this.shieldAtk, 0, 0, false);
        }
    }
}