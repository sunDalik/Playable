import {Game} from "../../../game"
import {ARMOR_TYPE, EQUIPMENT_TYPE, MAGIC_TYPE} from "../../../enums";
import {redrawAllMagicSlots, redrawSecondHand, redrawSlotContents, redrawWeapon} from "../../../drawing/draw_hud";

export class WizardRobe {
    constructor() {
        this.texture = Game.resources["src/images/armor/wizard_robe.png"].texture;
        this.type = ARMOR_TYPE.WIZARD_ROBE;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.magUses = 1;
        this.magAtk = 1;
    }

    onWear(player) {
        for (const magic of [player.magic1, player.magic2, player.magic3, player.magic4]) {
            if (magic) {
                magic.maxUses += this.magUses;
                magic.uses += this.magUses;
                if (magic.atk) magic.atk += this.magAtk;
            }
        }
        redrawAllMagicSlots(player);

        if (player.weapon && player.weapon.magical === true) {
            player.weapon.maxUses += this.magUses;
            player.weapon.uses += this.magUses;
            player.weapon.atk += this.magAtk;
            redrawWeapon(player);
        }
        if (player.secondHand && player.secondHand.magical === true) {
            player.secondHand.maxUses += this.magUses;
            player.secondHand.uses += this.magUses;
            player.secondHand.atk += this.magAtk;
            redrawSecondHand(player);
        }
    }

    onTakeOff(player) {
        for (const magic of [player.magic1, player.magic2, player.magic3, player.magic4]) {
            if (magic) {
                magic.maxUses -= this.magUses;
                magic.uses -= this.magUses;
                if (magic.type === MAGIC_TYPE.NECROMANCY) magic.removeIfExhausted(player);
                if (magic.atk) magic.atk -= this.magAtk;
            }
        }
        redrawAllMagicSlots(player);

        if (player.weapon && player.weapon.magical === true) {
            player.weapon.maxUses -= this.magUses;
            if (player.weapon.uses > 0) player.weapon.uses -= this.magUses;
            player.weapon.atk -= this.magAtk;
            redrawWeapon(player);
        }
        if (player.secondHand && player.secondHand.magical === true) {
            player.secondHand.maxUses -= this.magUses;
            if (player.secondHand.uses > 0) player.secondHand.uses -= this.magUses;
            player.secondHand.atk -= this.magAtk;
            redrawSecondHand(player);
        }
    }

    onMagicReceive(magic, player) {
        magic.maxUses += this.magUses;
        magic.uses += this.magUses;
        if (magic.atk) magic.atk += this.magAtk;
    }

    onEquipmentReceive(player, equipment) {
        if (equipment && equipment.magical === true) {
            equipment.maxUses += this.magUses;
            equipment.uses += this.magUses;
            equipment.atk += this.magAtk;
        }
    }

    onEquipmentDrop(player, equipment) {
        if (equipment && equipment.magical === true) {
            equipment.maxUses -= this.magUses;
            if (equipment.uses > 0) equipment.uses -= this.magUses;
            equipment.atk -= this.magAtk;
        }
    }
}