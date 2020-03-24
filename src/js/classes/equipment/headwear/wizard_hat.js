import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE, MAGIC_TYPE, RARITY} from "../../../enums";
import {redrawSlotContents} from "../../../drawing/draw_hud";
import {HeadWearSpriteSheet} from "../../../loader";

export class WizardHat {
    constructor() {
        this.texture = HeadWearSpriteSheet["wizard_hat.png"];
        this.type = HEAD_TYPE.WIZARD_HAT;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.magUses = 1;
        this.name = "Wizard Hat";
        this.description = "+1 magic use";
        this.rarity = RARITY.C;
    }

    onWear(player) {
        for (const eq of [player.magic1, player.magic2, player.magic3, player.weapon, player.secondHand]) {
            if (this.upgradeMagicEquipment(eq)) {
                redrawSlotContents(player, player.getPropertyNameOfItem(eq));
            }
        }
    }

    onTakeOff(player) {
        for (const eq of [player.magic1, player.magic2, player.magic3, player.weapon, player.secondHand]) {
            if (eq) {
                let preserveUses = false;
                if (eq.equipmentType === EQUIPMENT_TYPE.WEAPON) preserveUses = true;
                if (this.degradeMagicEquipment(eq, preserveUses)) {
                    if (eq.equipmentType === EQUIPMENT_TYPE.MAGIC && eq.type === MAGIC_TYPE.NECROMANCY) {
                        eq.removeIfExhausted(player);
                    }
                    redrawSlotContents(player, player.getPropertyNameOfItem(eq));
                }
            }
        }
    }

    onEquipmentReceive(player, equipment) {
        this.upgradeMagicEquipment(equipment)
    }

    onEquipmentDrop(player, equipment) {
        this.degradeMagicEquipment(equipment);
    }

    upgradeMagicEquipment(equipment) {
        if (equipment && (equipment.equipmentType === EQUIPMENT_TYPE.MAGIC || equipment.magical === true)) {
            if (equipment.uses !== undefined) {
                equipment.maxUses += this.magUses;
                equipment.uses += this.magUses;
            }
            return true;
        } else return false;
    }

    degradeMagicEquipment(equipment, preserveUses = false) {
        if (equipment && (equipment.equipmentType === EQUIPMENT_TYPE.MAGIC || equipment.magical === true)) {
            if (equipment.uses !== undefined) {
                equipment.maxUses -= this.magUses;
                if (!preserveUses || equipment.uses > 0) equipment.uses -= this.magUses;
            }
            return true;
        } else return false;
    }
}