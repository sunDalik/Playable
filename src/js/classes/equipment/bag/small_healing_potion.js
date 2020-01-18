import {Game} from "../../../game"
import {BAG_ITEM_TYPE, EQUIPMENT_TYPE, RARITY} from "../../../enums";

export class SmallHealingPotion {
    constructor() {
        this.texture = Game.resources["src/images/bag/small_healing_potion.png"].texture;
        this.type = BAG_ITEM_TYPE.SMALL_HEALING_POTION;
        this.equipmentType = EQUIPMENT_TYPE.BAG_ITEM;
        this.name = "Small Healing Potion";
        this.description = "Drink to restore 1 HP";
        this.amount = 1;
        this.healAmount = 1;
        this.rarity = RARITY.C;
    }

    useItem(player) {
        player.heal(this.healAmount);
        this.amount--;
    }
}