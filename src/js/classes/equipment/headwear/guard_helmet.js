import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class GuardHelmet extends Equipment{
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["guard_helmet.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.id = EQUIPMENT_ID.GUARD_HELMET;
        this.name = "Guard Helmet";
        this.description = "+0.5 defense";
        this.rarity = RARITY.B;
        this.passiveDef = 0.5;
    }
}