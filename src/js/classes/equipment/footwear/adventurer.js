import {EQUIPMENT_TYPE, FOOTWEAR_TYPE, RARITY} from "../../../enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class AdventurerBoots extends Equipment {
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["adventurer.png"];
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.type = FOOTWEAR_TYPE.ADVENTURER;
        this.name = "Adventurer Boots";
        this.description = "Immunity to poison hazards";
        this.rarity = RARITY.C;
        this.poisonImmunity = true;
    }
}