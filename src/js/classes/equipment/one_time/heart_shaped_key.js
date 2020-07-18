import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {Equipment} from "../equipment";
import {addKeys} from "../../../game_logic";
import {OneTimeSpriteSheet} from "../../../loader";

export class HeartShapedKey extends Equipment {
    constructor() {
        super();
        this.texture = OneTimeSpriteSheet["heart_shaped_key.png"];
        this.equipmentType = EQUIPMENT_TYPE.ONE_TIME;
        this.id = EQUIPMENT_ID.HEART_SHAPED_KEY;
        this.name = "Heart-Shaped Key";
        this.description = "Gain 1 heart container and 2 keys";
        this.rarity = RARITY.B;
    }

    useItem(player) {
        player.addHealthContainers(1);
        addKeys(2);
    }
}