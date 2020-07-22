import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {AccessoriesSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class RingOfProtection extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["ring_of_protection.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.RING_OF_PROTECTION;
        this.name = "Ring of Protection";
        this.description = "+0.25 defense";
        this.rarity = RARITY.C;
        this.passiveDef = 0.25;
    }
}