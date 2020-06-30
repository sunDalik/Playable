import {DAMAGE_TYPE, EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {AccessoriesSpriteSheet, EffectsSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";
import {TileElement} from "../../tile_elements/tile_element";
import {Game} from "../../../game";
import {easeOutQuad} from "../../../utils/math_utils";
import {randomChoice, randomInt} from "../../../utils/random_utils";

//todo increase chance of finding a bow?
export class QuiverOfTheForestSpirit extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["quiver_of_the_forest_spirit.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.QUIVER_OF_THE_FOREST_SPIRIT;
        this.bowAtk = 1;
        this.name = "Quiver of the Forest Spirit";
        //maybe should x2 the damage? so full range bow will have 2 dmg, 2 range will have 1.5 dmg and 1 range will have 0.5 dmg
        this.description = "All bows deal 1 more damage";
        this.rarity = RARITY.B;
    }
}