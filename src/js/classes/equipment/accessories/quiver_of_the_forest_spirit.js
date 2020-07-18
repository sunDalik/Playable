import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {AccessoriesSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

//todo increase chance of finding a bow?
export class QuiverOfTheForestSpirit extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["quiver_of_the_forest_spirit.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.QUIVER_OF_THE_FOREST_SPIRIT;
        this.bowAtk = 0.75;
        this.name = "Quiver of the Forest Spirit";
        this.description = "All bows deal 0.75 more damage";
        this.rarity = RARITY.B;
    }
}