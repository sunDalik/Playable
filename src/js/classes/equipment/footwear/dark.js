import {Game} from "../../../game"
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE} from "../../../enums";

export class DarkBoots {
    constructor() {
        this.texture = Game.resources["src/images/footwear/dark.png"].texture;
        this.type = FOOTWEAR_TYPE.DARK;
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
    }

    onWear(wielder) {
        wielder.poisonImmunity++;
        wielder.fireImmunity++;
    }

    onTakeOff(wielder) {
        wielder.poisonImmunity--;
        wielder.fireImmunity--;
    }
}