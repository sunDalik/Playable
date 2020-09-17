import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY, SLOT} from "../../../enums/enums";
import {AccessoriesSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class SapphireRing extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["sapphire_ring.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.SAPPHIRE_RING;
        this.name = "Sapphire Ring";
        this.passiveMagAtk = 0.25;
        this.description = "+0.25 magic attack\nReduces focus time of magic books by 1";
        this.rarity = RARITY.C;
    }

    onWear(wielder) {
        super.onWear(wielder);
        for (const eq of [wielder[SLOT.WEAPON], wielder[SLOT.EXTRA]]) {
            if (eq) this.upgradeMagicEquipment(wielder, eq);
        }
    }

    onTakeOff(wielder) {
        super.onTakeOff(wielder);
        for (const eq of [wielder[SLOT.WEAPON], wielder[SLOT.EXTRA]]) {
            if (eq) this.degradeMagicEquipment(wielder, eq);
        }
    }

    onEquipmentReceive(wielder, equipment) {
        this.upgradeMagicEquipment(wielder, equipment);
    }

    onEquipmentDrop(wielder, equipment) {
        this.degradeMagicEquipment(wielder, equipment);
    }

    upgradeMagicEquipment(wielder, equipment) {
        if (equipment.magical && equipment.focusTime) {
            equipment.focusTime--;
            if (equipment.currentFocus >= equipment.focusTime) {
                equipment.currentFocus = 0;
                equipment.uses = equipment.maxUses;
            }
            if (equipment.updateTexture) equipment.updateTexture(wielder);
            wielder.redrawEquipmentSlot(equipment);
        }
    }

    degradeMagicEquipment(wielder, equipment) {
        if (equipment.magical && equipment.focusTime) {
            equipment.focusTime++;
            if (equipment.updateTexture) equipment.updateTexture(wielder);
            wielder.redrawEquipmentSlot(equipment);
        }
    }
}