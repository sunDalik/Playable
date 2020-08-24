import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class WitchHat extends Equipment{
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["witch_hat.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.id = EQUIPMENT_ID.WITCH_HAT;
        this.passiveMagAtk = 1;
        this.name = "Witch Hat";
        this.description = "+1 magic attack";
        this.rarity = RARITY.C;
    }
}