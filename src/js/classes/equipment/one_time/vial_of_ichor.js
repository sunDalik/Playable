import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {Equipment} from "../equipment";
import {OneTimeSpriteSheet} from "../../../loader";
import {drawStatsForPlayer} from "../../../drawing/draw_hud";

export class VialOfIchor extends Equipment {
    constructor() {
        super();
        this.texture = OneTimeSpriteSheet["vial_of_ichor.png"];
        this.equipmentType = EQUIPMENT_TYPE.ONE_TIME;
        this.id = EQUIPMENT_ID.VIAL_OF_ICHOR;
        this.name = "Vial of Ichor";
        this.description = "Gain 1 heart container, +0.25 attack and +0.25 defense";
        this.rarity = RARITY.S;
    }

    useItem(player) {
        player.addHealthContainers(1);
        player.atkBase += 0.25;
        player.defBase += 0.25;
        drawStatsForPlayer(player);
    }
}