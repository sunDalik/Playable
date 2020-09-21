import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class StoneMask extends Equipment {
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["stone_mask.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.id = EQUIPMENT_ID.STONE_MASK;
        this.passiveAtk = 1.5;
        this.name = "Stone Mask";
        this.description = "+1.5 attack\nAny healing for this character is reduced to 0.25";
        this.rarity = RARITY.A;
    }
}