import {Game} from "../../../game"
import {EQUIPMENT_TYPE, SHIELD_TYPE} from "../../../enums";

export class PassiveShield {
    constructor() {
        this.texture = Game.resources["src/images/shields/passive.png"].texture;
        this.type = SHIELD_TYPE.PASSIVE;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.maxUses = 5;
        this.uses = this.maxUses;
    }

    onBlock() {

    }
}