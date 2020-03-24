import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";
import {redrawSecondHand} from "../../../drawing/draw_hud";
import {ShieldsSpriteSheet} from "../../../loader";

export class PassiveShield extends Shield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["passive_shield.png"];
        this.type = SHIELD_TYPE.PASSIVE;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.maxUses = 6;
        this.uses = this.maxUses;
        this.usedOnThisTurn = false;
        this.name = "Passive Shield";
        this.description = "Passively blocks damage";
        this.rarity = RARITY.S;
    }

    activate() {
        return this.uses > 0;
    }

    onBlock(source, wielder) {
        if (!this.usedOnThisTurn) {
            this.uses--;
            this.usedOnThisTurn = true;
            wielder.spinItem(this);
            redrawSecondHand(wielder);
        }
    }

    onNewTurn() {
        this.usedOnThisTurn = false;
    }
}