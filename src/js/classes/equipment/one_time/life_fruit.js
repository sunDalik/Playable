import {EQUIPMENT_TYPE, ONE_TIME_ITEM_TYPE, RARITY} from "../../../enums";
import {Equipment} from "../equipment";
import {OneTimeSpriteSheet} from "../../../loader";

export class LifeFruit extends Equipment {
    constructor() {
        super();
        this.texture = OneTimeSpriteSheet["life_fruit.png"];
        this.equipmentType = EQUIPMENT_TYPE.ONE_TIME;
        this.type = ONE_TIME_ITEM_TYPE.LIFE_FRUIT;
        this.name = "Life Fruit";
        this.description = "Gain 1 heart container";
        this.rarity = RARITY.B;
    }

    useItem(player) {
        player.addHealthContainers(1);
    }
}