import {Game} from "../../../game"
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE, RARITY} from "../../../enums";
import {FootwearSpriteSheet} from "../../../loader";

export class DamagingBoots {
    constructor() {
        this.texture = FootwearSpriteSheet["damaging.png"];
        this.type = FOOTWEAR_TYPE.DAMAGING;
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.atk = 0.5;
        this.name = "Damaging Boots";
        this.description = "+0.5 attack";
        this.rarity = RARITY.B;
    }
}