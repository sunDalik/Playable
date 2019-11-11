import {Game} from "../../../game"
import {EQUIPMENT_TYPE, TOOL_TYPE} from "../../../enums";

export class Pickaxe {
    constructor() {
        this.texture = Game.resources["src/images/tools/pickaxe.png"].texture;
        this.type = TOOL_TYPE.PICKAXE;
        this.equipmentType = EQUIPMENT_TYPE.TOOL;
    }

    //maybe write use() { } ?
}