import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {Equipment} from "../equipment";
import {OneTimeSpriteSheet} from "../../../loader";

export class DemonHeart extends Equipment {
    constructor() {
        super();
        this.texture = OneTimeSpriteSheet["demon_heart.png"];
        this.equipmentType = EQUIPMENT_TYPE.ONE_TIME;
        this.id = EQUIPMENT_ID.DEMON_HEART;
        this.name = "Demon Heart";
        this.description = "Gain 2 empty heart containers";
        this.rarity = RARITY.C;
    }

    useItem(player) {
        player.addHealthContainers(2, false);
    }
}