import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class WizardHat extends Equipment {
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["wizard_hat.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.id = EQUIPMENT_ID.WIZARD_HAT;
        this.magUses = 1;
        this.name = "Wizard Hat";
        this.description = "+1 magic use";
        this.rarity = RARITY.C;
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