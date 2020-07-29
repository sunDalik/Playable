import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class KitsuneMask extends Equipment {
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["kitsune_mask.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.id = EQUIPMENT_ID.KITSUNE_MASK;
        this.passiveAtk = 0.5;
        this.passiveMinionAtk = 0.5;
        this.name = "Kitsune Mask";
        this.description = "+0.5 attack\n+0.5 minion attack";
        this.rarity = RARITY.A;
    }
}