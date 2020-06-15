import {EQUIPMENT_TYPE, HEAD_TYPE, RARITY} from "../../../enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class WitchHat extends Equipment{
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["witch_hat.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.type = HEAD_TYPE.WITCH_HAT;
        this.passiveMagAtk = 0.5;
        this.name = "Witch Hat";
        this.description = "+0.5 magic attack";
        this.rarity = RARITY.C;
    }
}