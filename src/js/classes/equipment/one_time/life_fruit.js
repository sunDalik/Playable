import {Game} from "../../../game";
import {EQUIPMENT_TYPE, ONE_TIME_ITEM_TYPE, RARITY} from "../../../enums";
import {Equipment} from "../equipment";

export class LifeFruit extends Equipment {
    constructor() {
        super();
        this.texture = Game.resources["src/images/one_time/life_fruit.png"].texture;
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