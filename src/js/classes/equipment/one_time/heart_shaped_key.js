import {Game} from "../../../game";
import {EQUIPMENT_TYPE, ONE_TIME_ITEM_TYPE, RARITY} from "../../../enums";
import {Equipment} from "../equipment";
import {redrawKeysAmount} from "../../../drawing/draw_hud";

export class HeartShapedKey extends Equipment {
    constructor() {
        super();
        this.texture = Game.resources["src/images/one_time/heart_shaped_key.png"].texture;
        this.equipmentType = EQUIPMENT_TYPE.ONE_TIME;
        this.type = ONE_TIME_ITEM_TYPE.HEART_SHAPED_KEY;
        this.name = "Heart-Shaped Key";
        this.description = "Gain 1 heart container and 2 keys";
        this.rarity = RARITY.B;
    }

    useItem(player) {
        player.addHealthContainers(1);
        Game.keys += 2;
        redrawKeysAmount();
    }
}