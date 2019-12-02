import {Game} from "../../../game"
import {EQUIPMENT_TYPE, TOOL_TYPE} from "../../../enums";

export class Torch {
    constructor() {
        this.texture = Game.resources["src/images/tools/torch.png"].texture;
        this.type = TOOL_TYPE.TORCH;
        this.equipmentType = EQUIPMENT_TYPE.TOOL;
        this.lightSpread = 2;
    }

    use() {
        return false;
    }
}