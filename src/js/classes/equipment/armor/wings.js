import {Game} from "../../../game"
import {EQUIPMENT_TYPE, ARMOR_TYPE} from "../../../enums";

export class Wings {
    constructor() {
        this.texture = Game.resources["src/images/armor/wings.png"].texture;
        this.type = ARMOR_TYPE.WINGS;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.def = 0;
        this.movement = 1;
    }

    onWear(player) {
        player.movement += this.movement;
    }

    onTakeOff(player) {
        player.movement -= this.movement;
    }
}