import {EQUIPMENT_TYPE, RARITY} from "../../enums/enums";
import {CommonSpriteSheet} from "../../loader";

export class Key {
    constructor() {
        this.texture = CommonSpriteSheet["key.png"];
        this.equipmentType = EQUIPMENT_TYPE.KEY;
        this.name = "Key";
        this.description = "Keys are used to open chests and buy items from shops";
        this.rarity = RARITY.C;
    }
}