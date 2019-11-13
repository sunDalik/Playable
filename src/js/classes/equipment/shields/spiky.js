import {Game} from "../../../game"
import {EQUIPMENT_TYPE, SHIELD_TYPE} from "../../../enums";

export class SpikyShield {
    constructor() {
        this.texture = Game.resources["src/images/shields/spiky.png"].texture;
        this.type = SHIELD_TYPE.SPIKY;
        this.equipmentType = EQUIPMENT_TYPE.SHIELD;
        this.maxUses = 6;
        this.uses = this.maxUses;
    }

    onBlock() {

    }
}