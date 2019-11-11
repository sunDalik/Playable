"use strict";

class DamagingBoots {
    constructor() {
        this.texture = Game.resources["src/images/footwear/damaging.png"].texture;
        this.type = FOOTWEAR_TYPE.DAMAGING;
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.atk = 1;
    }
}