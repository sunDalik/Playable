import {Game} from "../../../game"
import {ARMOR_TYPE, EQUIPMENT_TYPE, MAGIC_TYPE} from "../../../enums";
import {redrawSlotContents} from "../../../drawing/draw_hud";

export class WizardRobe {
    constructor() {
        this.texture = Game.resources["src/images/armor/wizard_robe.png"].texture;
        this.type = ARMOR_TYPE.WIZARD_ROBE;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.magUses = 1;
        this.magAtk = 1;
    }

    onWear(player) {
        for (const eq of [player.magic1, player.magic2, player.magic3, player.magic4, player.weapon, player.secondHand]) {
            if (this.upgradeMagicEquipment(eq)) {
                redrawSlotContents(player, player.getPropertyNameOfItem(eq));
            }
        }
    }

    onTakeOff(player) {
        for (const eq of [player.magic1, player.magic2, player.magic3, player.magic4, player.weapon, player.secondHand]) {
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
            if (equipment.atk) equipment.atk += this.magAtk;
            return true;
        } else return false;
    }

    degradeMagicEquipment(equipment, preserveUses = false) {
        if (equipment && (equipment.equipmentType === EQUIPMENT_TYPE.MAGIC || equipment.magical === true)) {
            if (equipment.uses !== undefined) {
                equipment.maxUses -= this.magUses;
                if (!preserveUses || equipment.uses > 0) equipment.uses -= this.magUses;
            }
            if (equipment.atk) equipment.atk -= this.magAtk;
            return true;
        } else return false;
    }
}