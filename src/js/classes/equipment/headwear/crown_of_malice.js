import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class CrownOfMalice extends Equipment {
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["crown_of_malice.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.id = EQUIPMENT_ID.CROWN_OF_MALICE;
        this.passiveAtk = 0.25;
        this.name = "Crown of Malice";
        this.description = "+0.25 attack";
        this.rarity = RARITY.C;
    }
}