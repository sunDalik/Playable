import {ACCESSORY_TYPE, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class FlaskOfFire extends Equipment {
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["flask_of_fire.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.type = ACCESSORY_TYPE.FLASK_OF_FIRE;
        this.name = "Flask of Fire";
        this.description = "???????";
        this.rarity = RARITY.C;
    }
}