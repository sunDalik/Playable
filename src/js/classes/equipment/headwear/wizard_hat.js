import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE, MAGIC_TYPE, WEAPON_TYPE} from "../../../enums";
import {redrawAllMagicSlots, redrawSecondHand, redrawSlotContents, redrawWeapon} from "../../../drawing/draw_hud";

export class WizardHat {
    constructor() {
        this.texture = Game.resources["src/images/headwear/wizard_hat.png"].texture;
        this.type = HEAD_TYPE.WIZARD_HAT;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.magUses = 1;
    }

    onWear(player) {
        for (const magic of [player.magic1, player.magic2, player.magic3, player.magic4]) {
            if (magic) {
                magic.maxUses += this.magUses;
                magic.uses += this.magUses;
            }
        }
        redrawAllMagicSlots(player);
        if (player.weapon && player.weapon.magical === true) {
            player.weapon.maxUses += this.magUses;
            player.weapon.uses += this.magUses;
            redrawWeapon(player);
        }
        if (player.secondHand && player.secondHand.magical === true) {
            player.secondHand.maxUses += this.magUses;
            player.secondHand.uses += this.magUses;
            redrawSecondHand(player);
        }
    }

    onTakeOff(player) {
        for (const magic of [player.magic1, player.magic2, player.magic3, player.magic4]) {
            if (magic) {
                magic.maxUses -= this.magUses;
                magic.uses -= this.magUses;
                if (magic.type === MAGIC_TYPE.NECROMANCY) magic.removeIfExhausted(player);
            }
        }
        redrawAllMagicSlots(player);
        if (player.weapon && player.weapon.magical === true) {
            player.weapon.maxUses -= this.magUses;
            if (player.weapon.uses > 0) player.weapon.uses -= this.magUses;
            redrawWeapon(player);
        }
        if (player.secondHand && player.secondHand.magical === true) {
            player.secondHand.maxUses -= this.magUses;
            if (player.secondHand.uses > 0) player.secondHand.uses -= this.magUses;
            redrawSecondHand(player);
        }
    }

    onMagicReceive(magic, player) {
        magic.maxUses += this.magUses;
        magic.uses += this.magUses;
    }

    onEquipmentReceive(player, equipment) {
        if (equipment && equipment.magical === true) {
            equipment.maxUses += this.magUses;
            equipment.uses += this.magUses;
        }
    }

    onEquipmentDrop(player, equipment) {
        if (equipment && equipment.magical === true) {
            equipment.maxUses -= this.magUses;
            if (equipment.uses > 0) equipment.uses -= this.magUses;
        }
    }
}