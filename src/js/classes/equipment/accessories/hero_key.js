import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {AccessoriesSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

//todo make it a cute follower instead?
export class HeroKey extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["hero_key.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.HERO_KEY;
        this.name = "Hero Key";
        this.description = "Can unlock any chest by 1 key";
        this.rarity = RARITY.A;
    }
}