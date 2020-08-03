import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {Equipment} from "../equipment";
import {OneTimeSpriteSheet} from "../../../loader";

export class EssenceOfLight extends Equipment {
    constructor() {
        super();
        this.texture = OneTimeSpriteSheet["essence_of_light.png"];
        this.equipmentType = EQUIPMENT_TYPE.ONE_TIME;
        this.id = EQUIPMENT_ID.ESSENCE_OF_LIGHT;
        this.lightSpread = 4;
        this.name = "Essence of Light";
        this.description = "Provides light in the Dark Tunnel\nDoes not occupy any slot, unlike Torch";
        this.rarity = RARITY.UNIQUE;
    }

    useItem(player) {
    }
}