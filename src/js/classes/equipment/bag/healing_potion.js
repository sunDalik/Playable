import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {BagSpriteSheet} from "../../../loader";
import {BagEquipment} from "../bag_equipment";

export class HealingPotion extends BagEquipment {
    constructor() {
        super();
        this.texture = BagSpriteSheet["small_healing_potion.png"];
        this.id = EQUIPMENT_ID.HEALING_POTION;
        this.name = "Healing Potion";
        this.description = "Drink to restore 1 HP";
        this.healAmount = 1;
        this.rarity = RARITY.C;
    }

    useItem(wielder) {
        super.useItem();
        wielder.heal(this.healAmount);
    }
}