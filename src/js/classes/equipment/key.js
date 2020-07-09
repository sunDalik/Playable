import {EQUIPMENT_TYPE, RARITY} from "../../enums";
import {CommonSpriteSheet} from "../../loader";

export class Key {
    constructor() {
        this.texture = CommonSpriteSheet["key.png"];
        this.equipmentType = EQUIPMENT_TYPE.KEY;
        this.name = "Key";
        this.description = "Opens chests";
        this.rarity = RARITY.C;
    }
}