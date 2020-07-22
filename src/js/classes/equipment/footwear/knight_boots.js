import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class KnightBoots extends Equipment {
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["knight_boots.png"];
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.id = EQUIPMENT_ID.KNIGHT_BOOTS;
        this.name = "Knight Boots";
        this.description = "Immunity to hazards\n+0.5 defense";
        this.rarity = RARITY.A;
        this.poisonImmunity = true;
        this.fireImmunity = true;
        this.passiveDef = 0.5;
    }
}