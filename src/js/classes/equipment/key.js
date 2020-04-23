import {Game} from "../../game"
import {EQUIPMENT_TYPE, RARITY} from "../../enums";

export class Key {
    constructor() {
        this.texture = Game.resources["src/images/key.png"].texture;
        this.equipmentType = EQUIPMENT_TYPE.KEY;
        this.name = "Key";
        this.description = "Opens chests";
        this.rarity = RARITY.C;
    }
}