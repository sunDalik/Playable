import {Game} from "../../../game"
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE, HAZARD_TYPE} from "../../../enums";

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

    onNewTurn(wielder) {
        if (wielder.carried) return false;
        const hazard = Game.map[wielder.tilePosition.y][wielder.tilePosition.x].hazard;
        if (hazard) {
            if (hazard.type === HAZARD_TYPE.POISON || hazard.type === HAZARD_TYPE.FIRE) {
                hazard.turnToDark();
            }
        }
    }
}