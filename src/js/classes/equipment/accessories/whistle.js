import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {AccessoriesSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class Whistle extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["whistle.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.WHISTLE;
        this.passiveMinionAtk = 0.5;
        this.name = "Whistle";
        this.description = "+0.5 minion attack";
        this.rarity = RARITY.C;
    }
}