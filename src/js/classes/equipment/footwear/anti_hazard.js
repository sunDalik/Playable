import {Game} from "../../../game"
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE} from "../../../enums";

export class AntiHazardBoots {
    constructor() {
        this.texture = Game.resources["src/images/footwear/anti_hazard.png"].texture;
        this.type = FOOTWEAR_TYPE.ANTI_HAZARD;
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
    }
}