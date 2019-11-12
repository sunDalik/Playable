import {Game} from "../../../game"
import {EQUIPMENT_TYPE, ARMOR_TYPE} from "../../../enums";

export class WizardRobe {
    constructor() {
        this.texture = Game.resources["src/images/armor/wizard_robe.png"].texture;
        this.type = ARMOR_TYPE.WIZARD_ROBE;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.magUses = 1;
        this.magAtk = 1;
    }

    onWear(player) {

    }

    onTakeOff(player) {

    }
}