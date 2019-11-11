import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE} from "../../../enums";

export class SeerCirclet {
    constructor() {
        this.texture = Game.resources["src/images/headwear/seer_circlet.png"].texture;
        this.type = HEAD_TYPE.SEER_CIRCLET;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
    }
}