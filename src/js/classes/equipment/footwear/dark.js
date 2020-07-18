import {Game} from "../../../game";
import {EQUIPMENT_ID, EQUIPMENT_TYPE, HAZARD_TYPE, RARITY} from "../../../enums/enums";
import {FootwearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class DarkBoots extends Equipment {
    constructor() {
        super();
        this.texture = FootwearSpriteSheet["dark.png"];
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.id = EQUIPMENT_ID.DARK_BOOTS;
        this.name = "Dark Boots";
        this.description = "Immunity to hazards\nHazards turn to dark hazards when you step on them\nDark hazards damage both enemies and players";
        this.rarity = RARITY.B;
        this.poisonImmunity = true;
        this.fireImmunity = true;
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