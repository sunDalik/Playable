import {EQUIPMENT_TYPE, RARITY, TOOL_TYPE} from "../../../enums";
import {ToolsSpriteSheet} from "../../../loader";
import {statueRightHandPoint} from "../../inanimate_objects/statue";
import {Equipment} from "../equipment";

export class Torch extends Equipment{
    constructor() {
        super();
        this.texture = ToolsSpriteSheet["torch.png"];
        this.type = TOOL_TYPE.TORCH;
        this.equipmentType = EQUIPMENT_TYPE.TOOL;
        this.lightSpread = 3;
        this.name = "Torch";
        this.description = "Provides light in the Dark Tunnel";
        this.rarity = RARITY.UNIQUE;
    }

    use() {
        return false;
    }

    getStatuePlacement() {
        return {
            x: statueRightHandPoint.x,
            y: statueRightHandPoint.y - 60,
            angle: 0,
            scaleModifier: 0.9
        };
    }
}