import {EQUIPMENT_ID, RARITY, SLOT} from "../../../enums/enums";
import {BagSpriteSheet} from "../../../loader";
import {BagEquipment} from "../bag_equipment";

export class ManaPotion extends BagEquipment {
    constructor() {
        super();
        this.texture = BagSpriteSheet["mana_potion.png"];
        this.id = EQUIPMENT_ID.MANA_POTION;
        this.name = "Mana Potion";
        this.description = "Drink to increase max uses of all magic and magic books you currently hold by 1";
        this.rarity = RARITY.UNIQUE;
    }

    useItem(wielder) {
        super.useItem();
        for (const eq of [wielder[SLOT.MAGIC1], wielder[SLOT.MAGIC2], wielder[SLOT.MAGIC3], wielder[SLOT.WEAPON], wielder[SLOT.EXTRA]]) {
            if (eq && eq.magical && eq.maxUses > 0) {
                eq.maxUses++;
                eq.uses++;
                wielder.redrawEquipmentSlot(eq);
            }
        }
    }
}