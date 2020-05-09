import {EQUIPMENT_TYPE, HEAD_TYPE, MAGIC_TYPE, RARITY} from "../../../enums";
import {HeadWearSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class WizardHat extends Equipment {
    constructor() {
        super();
        this.texture = HeadWearSpriteSheet["wizard_hat.png"];
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.type = HEAD_TYPE.WIZARD_HAT;
        this.magUses = 1;
        this.name = "Wizard Hat";
        this.description = "+1 magic use";
        this.rarity = RARITY.C;
    }

    onWear(player) {
        for (const eq of [player.magic1, player.magic2, player.magic3, player.weapon, player.secondHand]) {
            if (eq) this.upgradeMagicEquipment(eq);
        }
    }

    onTakeOff(player) {
        for (const eq of [player.magic1, player.magic2, player.magic3, player.weapon, player.secondHand]) {
            if (eq) {
                const preserveUses = eq.equipmentType === EQUIPMENT_TYPE.WEAPON;
                if (this.degradeMagicEquipment(eq, preserveUses)) {
                    if (eq.equipmentType === EQUIPMENT_TYPE.MAGIC && eq.type === MAGIC_TYPE.NECROMANCY) {
                        eq.removeIfExhausted(player);
                    }
                }
            }
        }
    }

    onEquipmentReceive(player, equipment) {
        this.upgradeMagicEquipment(equipment);
    }

    onEquipmentDrop(player, equipment) {
        this.degradeMagicEquipment(equipment);
    }

    upgradeMagicEquipment(equipment) {
        if (equipment.magical) {
            if (equipment.maxUses > 0) {
                equipment.maxUses += this.magUses;
                equipment.uses += this.magUses;
            }
            return true;
        } else return false;
    }

    degradeMagicEquipment(equipment, preserveUses = false) {
        if (equipment.magical) {
            if (equipment.maxUses > 0) {
                equipment.maxUses -= this.magUses;
                if (!preserveUses || equipment.uses > 0) equipment.uses -= this.magUses;
            }
            return true;
        } else return false;
    }
}