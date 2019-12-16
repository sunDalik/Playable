import {Game} from "../../../game"
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE, HAZARD_TYPE} from "../../../enums";

export class DarkBoots {
    constructor() {
        this.texture = Game.resources["src/images/footwear/dark.png"].texture;
        this.type = FOOTWEAR_TYPE.DARK;
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.name = "Dark Boots";
        this.description = "Turn hazards to your will...";
    }

    onWear(wielder) {
        wielder.poisonImmunity++;
        wielder.fireImmunity++;
    }

    onTakeOff(wielder) {
        wielder.poisonImmunity--;
        wielder.fireImmunity--;
    }

    //should boots work with wings or nah?...
    onNewTurn(wielder) {
        const hazard = Game.map[wielder.tilePosition.y][wielder.tilePosition.x].hazard;
        if (hazard) {
            if (hazard.type === HAZARD_TYPE.POISON || hazard.type === HAZARD_TYPE.FIRE) {
                hazard.turnToDark();
            }
        }
    }
}