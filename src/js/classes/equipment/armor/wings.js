import {ARMOR_TYPE, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class Wings extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["wings.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.type = ARMOR_TYPE.WINGS;
        this.def = 0;
        this.dodgeChance = 0.5;
        this.name = "Wings";
        this.description = "50% to dodge any attack\nImmunity to hazards";
        this.rarity = RARITY.S;
        this.poisonImmunity = true;
        this.fireImmunity = true;
    }
}