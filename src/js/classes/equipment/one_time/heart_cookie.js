import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {Equipment} from "../equipment";
import {OneTimeSpriteSheet} from "../../../loader";

export class HeartCookie extends Equipment {
    constructor() {
        super();
        this.texture = OneTimeSpriteSheet["heart_cookie.png"];
        this.equipmentType = EQUIPMENT_TYPE.ONE_TIME;
        this.id = EQUIPMENT_ID.HEART_COOKIE;
        this.name = "Heart Cookie";
        this.description = "Gain 1 heart container";
        this.rarity = RARITY.C;
    }

    useItem(player) {
        player.addHealthContainers(1);
    }
}