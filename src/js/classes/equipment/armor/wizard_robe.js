import {Game} from "../../../game"
import {ARMOR_TYPE, EQUIPMENT_TYPE, MAGIC_TYPE} from "../../../enums";
import {redrawSlotsForPlayer} from "../../../draw";

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
        redrawSlotsForPlayer(player);
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
        redrawSlotsForPlayer(player);
    }

    onMagicReceive(magic) {
        magic.maxUses += this.magUses;
        magic.uses += this.magUses;
        if (magic.atk) magic.atk += this.magAtk;
    }
}