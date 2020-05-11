import {BAG_ITEM_TYPE, RARITY} from "../../../enums";
import {BagSpriteSheet} from "../../../loader";
import {BagEquipment} from "../bag_equipment";

export class SmallHealingPotion extends BagEquipment {
    constructor() {
        super();
        this.texture = BagSpriteSheet["small_healing_potion.png"];
        this.type = BAG_ITEM_TYPE.SMALL_HEALING_POTION;
        this.name = "Small Healing Potion";
        this.description = "Drink to restore 1 HP";
        this.healAmount = 1;
        this.rarity = RARITY.C;
    }

    useItem(wielder) {
        super.useItem();
        wielder.heal(this.healAmount);
    }
}