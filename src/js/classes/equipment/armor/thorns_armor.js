import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class ThornsArmor extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["thorns_armor.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.id = EQUIPMENT_ID.THORNS_ARMOR;
        this.name = "Thorns Armor";
        this.description = "Enemies that attack you directly take x3 damage back";
        this.rarity = RARITY.C;
    }
}