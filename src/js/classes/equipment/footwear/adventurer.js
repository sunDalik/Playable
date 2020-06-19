import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class AdventurerBoots extends Equipment {
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["adventurer.png"];
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.id = EQUIPMENT_ID.ADVENTURER_BOOTS;
        this.name = "Adventurer Boots";
        this.description = "Immunity to poison hazards";
        this.rarity = RARITY.C;
        this.poisonImmunity = true;
    }
}