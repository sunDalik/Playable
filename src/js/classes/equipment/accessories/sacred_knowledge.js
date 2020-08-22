import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {AccessoriesSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class SacredKnowledge extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["sacred_knowledge.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.SACRED_KNOWLEDGE;
        this.passiveAtk = 0.25;
        this.passiveDef = 0.25;
        this.passiveMagAtk = 0.25;
        this.passiveMinionAtk = 0.25;
        this.name = "Sacred Knowledge";
        this.description = "+0.25 attack\n+0.25 defense\n+0.25 magic attack\n+0.25 minion attack";
        this.rarity = RARITY.A;
    }
}