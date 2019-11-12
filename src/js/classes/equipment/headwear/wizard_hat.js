import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE} from "../../../enums";

export class WizardHat {
    constructor() {
        this.texture = Game.resources["src/images/headwear/wizard_hat.png"].texture;
        this.type = HEAD_TYPE.WIZARD_HAT;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.magUses = 1;
    }

    onWear(player) {

    }

    onTakeOff(player) {

    }
}