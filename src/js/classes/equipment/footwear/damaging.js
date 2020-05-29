import {EQUIPMENT_TYPE, FOOTWEAR_TYPE, RARITY} from "../../../enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class DamagingBoots extends Equipment {
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["damaging.png"];
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.type = FOOTWEAR_TYPE.DAMAGING;
        this.passiveAtk = 0.5;
        this.name = "Damaging Boots";
        this.description = "+0.5 attack";
        this.rarity = RARITY.B;
    }
}