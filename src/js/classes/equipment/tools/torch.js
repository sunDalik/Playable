import {EQUIPMENT_TYPE, RARITY, TOOL_TYPE} from "../../../enums";
import {ToolsSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class Torch extends Equipment{
    constructor() {
        super();
        this.texture = ToolsSpriteSheet["torch.png"];
        this.equipmentType = EQUIPMENT_TYPE.TOOL;
        this.type = TOOL_TYPE.TORCH;
        this.lightSpread = 3;
        this.name = "Torch";
        this.description = "Provides light in the Dark Tunnel";
        this.rarity = RARITY.UNIQUE;
    }

    use() {
        return false;
    }
}