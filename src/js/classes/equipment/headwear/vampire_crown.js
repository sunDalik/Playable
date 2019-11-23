import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE} from "../../../enums";

export class VampireCrown {
    constructor() {
        this.texture = Game.resources["src/images/headwear/vampire_crown.png"].texture;
        this.type = HEAD_TYPE.VAMPIRE_CROWN;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
    }
}