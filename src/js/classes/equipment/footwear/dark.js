import {Game} from "../../../game"
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE, HAZARD_TYPE, RARITY} from "../../../enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class DarkBoots extends Equipment{
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["dark.png"];
        this.type = FOOTWEAR_TYPE.DARK;
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.name = "Dark Boots";
        this.description = "Turn hazards to your will...";
        this.rarity = RARITY.B;
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