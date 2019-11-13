import {Game} from "../../../game"
import {EQUIPMENT_TYPE, SHIELD_TYPE} from "../../../enums";
import {Shield} from "./shield";
import {redrawSlotsForPlayer} from "../../../draw";

export class PassiveShield extends Shield {
    constructor() {
        super();
        this.texture = Game.resources["src/images/shields/passive.png"].texture;
        this.type = SHIELD_TYPE.PASSIVE;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.maxUses = 5;
        this.uses = this.maxUses;
        this.usedOnThisTurn = false;
    }

    activate() {
        return false;
    }

    onBlock(source, wielder) {
        if (!this.usedOnThisTurn) {
            this.uses--;
            this.usedOnThisTurn = true;
            wielder.spinItem(this);
            redrawSlotsForPlayer(wielder);
            if (this.uses <= 0) this.exhausted = true;
        }
        return true;
    }

    onNewTurn() {
        this.usedOnThisTurn = false;
    }
}