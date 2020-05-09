import {Game} from "../../../game";
import {ARMOR_TYPE, EQUIPMENT_TYPE, MAGIC_TYPE, RARITY} from "../../../enums";
import {redrawSlotContents} from "../../../drawing/draw_hud";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class WizardRobe extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["wizard_robe.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.type = ARMOR_TYPE.WIZARD_ROBE;
        this.magUses = 1;
        this.magAtk = 1;
        this.name = "Wizard Robe";
        this.description = "+1 magic use, +1 magic attack";
        this.rarity = RARITY.A;
    }

    onWear(player) {
        for (const eq of [player.magic1, player.magic2, player.magic3, player.weapon, player.secondHand]) {
            if (this.upgradeMagicEquipment(eq)) {
                redrawSlotContents(player, player.getSlotNameOfItem(eq));
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
                    redrawSlotContents(player, player.getSlotNameOfItem(eq));
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