import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ToolsSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class Torch extends Equipment{
    constructor() {
        super();
        this.texture = ToolsSpriteSheet["torch.png"];
        this.equipmentType = EQUIPMENT_TYPE.TOOL;
        this.id = EQUIPMENT_ID.TORCH;
        this.lightSpread = 3;
        this.name = "Torch";
        this.description = "Provides light in the Dark Tunnel";
        this.rarity = RARITY.UNIQUE;
    }

    use() {
        return false;
    }
}