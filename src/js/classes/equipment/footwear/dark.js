import {Game} from "../../../game"
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE, HAZARD_TYPE} from "../../../enums";
import {addHazardToWorld} from "../../../game_logic";
import {DarkFireHazard} from "../../hazards/dark_fire";
import {DarkPoisonHazard} from "../../hazards/dark_poison";

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
        const hazard = Game.map[wielder.tilePosition.y][wielder.tilePosition.x].hazard;
        if (hazard) {
            if (hazard.type === HAZARD_TYPE.POISON) {
                addHazardToWorld(new DarkPoisonHazard(wielder.tilePosition.x, wielder.tilePosition.y))
            } else if (hazard.type === HAZARD_TYPE.FIRE) {
                addHazardToWorld(new DarkFireHazard(wielder.tilePosition.x, wielder.tilePosition.y))
            }
        }
    }
}