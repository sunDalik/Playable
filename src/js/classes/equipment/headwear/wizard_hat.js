import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE, MAGIC_TYPE} from "../../../enums";
import {redrawAllMagicSlots} from "../../../drawing/draw_hud";

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
    }

    onMagicReceive(magic, player) {
        magic.maxUses += this.magUses;
        magic.uses += this.magUses;
    }
}