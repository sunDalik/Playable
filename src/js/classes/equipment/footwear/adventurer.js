import {Game} from "../../../game"
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE} from "../../../enums";

export class AdventurerBoots {
    constructor() {
        this.texture = Game.resources["src/images/footwear/adventurer.png"].texture;
        this.type = FOOTWEAR_TYPE.ADVENTURER;
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
    }

    onWear(wielder) {
        wielder.poisonImmunity++;
    }

    onTakeOff(wielder) {
        wielder.poisonImmunity--;
    }
}