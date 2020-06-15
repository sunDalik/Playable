import {EQUIPMENT_TYPE, HEAD_TYPE, RARITY} from "../../../enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class BattleHelmet extends Equipment{
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["battle_helmet.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.type = HEAD_TYPE.BATTLE_HELMET;
        this.name = "Battle Helmet";
        this.description = "+0.5 defense";
        this.rarity = RARITY.B;
        this.passiveDef = 0.5;
    }
}