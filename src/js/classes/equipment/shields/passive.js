import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";
import {redrawSecondHand} from "../../../drawing/draw_hud";

export class PassiveShield extends Shield {
    constructor() {
        super();
        this.texture = Game.resources["src/images/shields/passive.png"].texture;
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
        return false;
    }

    onBlock(source, wielder) {
        if (this.uses <= 0) return false;
        if (!this.usedOnThisTurn) {
            this.uses--;
            this.usedOnThisTurn = true;
            wielder.spinItem(this);
            redrawSecondHand(wielder);
        }
        return true;
    }

    onNewTurn() {
        this.usedOnThisTurn = false;
    }
}