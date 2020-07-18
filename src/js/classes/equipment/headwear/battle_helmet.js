import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class BattleHelmet extends Equipment{
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["battle_helmet.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.id = EQUIPMENT_ID.BATTLE_HELMET;
        this.name = "Battle Helmet";
        this.description = "+0.5 defense";
        this.rarity = RARITY.B;
        this.passiveDef = 0.5;
    }
}