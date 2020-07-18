import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {ShieldsSpriteSheet} from "../../../loader";
import {AbstractShield} from "./abstract_shield";

export class SpikyShield extends AbstractShield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["spiky_shield.png"];
        this.id = EQUIPMENT_ID.SPIKY_SHIELD;
        this.shieldAtk = 1;
        this.uses = this.maxUses = 3;
        this.name = "Spiky Shield";
        this.description = "Automatically blocks incoming attacks\nDamages attackers on block";
        this.rarity = RARITY.B;
    }

    onBlock(source, wielder, directHit) {
        if (directHit) {
            source.damage(wielder, this.shieldAtk, 0, 0);
        }
    }
}