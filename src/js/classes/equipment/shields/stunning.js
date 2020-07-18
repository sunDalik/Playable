import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {ShieldsSpriteSheet} from "../../../loader";
import {AbstractShield} from "./abstract_shield";

export class StunningShield extends AbstractShield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["stunning_shield.png"];
        this.id = EQUIPMENT_ID.STUNNING_SHIELD;
        this.uses = this.maxUses = 3;
        this.name = "Stunning Shield";
        this.description = "Automatically blocks incoming attacks\nStuns attackers on block";
        this.rarity = RARITY.B;
    }

    onBlock(source, wielder, directHit) {
        if (directHit) {
            source.addStun(4);
        }
    }
}