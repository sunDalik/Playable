import {Game} from "../../../game"
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE} from "../../../enums";

export class DamagingBoots {
    constructor() {
        this.texture = Game.resources["src/images/footwear/damaging.png"].texture;
        this.type = FOOTWEAR_TYPE.DAMAGING;
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.atk = 0.5;
    }
}