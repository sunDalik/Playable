import {EQUIPMENT_TYPE, RARITY, TOOL_TYPE} from "../../../enums";
import {ToolsSpriteSheet} from "../../../loader";

export class Torch {
    constructor() {
        this.texture = ToolsSpriteSheet["torch.png"];
        this.type = TOOL_TYPE.TORCH;
        this.equipmentType = EQUIPMENT_TYPE.TOOL;
        this.lightSpread = 3;
        this.name = "Torch";
        this.description = "You are safe now";
        this.rarity = RARITY.UNIQUE;
    }

    use() {
        return false;
    }
}