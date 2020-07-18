import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class WizardRobe extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["wizard_robe.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.id = EQUIPMENT_ID.WIZARD_ROBE;
        this.magUses = 1;
        this.passiveMagAtk = 1;
        this.name = "Wizard Robe";
        this.description = "+1 magic use\n+1 magic attack";
        this.rarity = RARITY.A;
    }

    onWear(wielder) {
        super.onWear(wielder);
        for (const eq of [wielder.magic1, wielder.magic2, wielder.magic3, wielder.weapon, wielder.secondHand]) {
            if (eq) this.upgradeMagicEquipment(wielder, eq);
        }
    }

    onTakeOff(wielder) {
        super.onTakeOff(wielder);
        for (const eq of [wielder.magic1, wielder.magic2, wielder.magic3, wielder.weapon, wielder.secondHand]) {
            if (eq) {
                const preserveUses = eq.equipmentType === EQUIPMENT_TYPE.WEAPON;
                if (this.degradeMagicEquipment(wielder, eq, preserveUses)) {
                    if (eq.id === EQUIPMENT_ID.NECROMANCY) {
                        eq.removeIfExhausted(wielder);
                    }
                }
            }
        }
    }

    onEquipmentReceive(wielder, equipment) {
        this.upgradeMagicEquipment(wielder, equipment);
    }

    onEquipmentDrop(wielder, equipment) {
        this.degradeMagicEquipment(wielder, equipment);
    }

    upgradeMagicEquipment(wielder, equipment) {
        if (equipment.magical) {
            if (equipment.maxUses > 0) {
                equipment.maxUses += this.magUses;
                equipment.uses += this.magUses;
                wielder.redrawEquipmentSlot(equipment);
            }
            return true;
        } else return false;
    }

    degradeMagicEquipment(wielder, equipment, preserveUses = false) {
        if (equipment.magical) {
            if (equipment.maxUses > 0) {
                equipment.maxUses -= this.magUses;
                if (!preserveUses || equipment.uses > 0) equipment.uses -= this.magUses;
                wielder.redrawEquipmentSlot(equipment);
            }
            return true;
        } else return false;
    }
}