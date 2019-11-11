"use strict";

class WizardHat {
    constructor() {
        this.texture = Game.resources["src/images/headwear/wizard_hat.png"].texture;
        this.type = HEAD_TYPE.WIZARD_HAT;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.magUses = 1;
    }
}