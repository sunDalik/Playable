import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class BarbarianHelmet extends Equipment {
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["barbarian_helmet.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.id = EQUIPMENT_ID.BARBARIAN_HELMET;
        this.passiveAtk = 0.75;
        this.name = "Barbarian Helmet";
        this.description = "+0.75 attack";
        this.rarity = RARITY.B;
    }
}