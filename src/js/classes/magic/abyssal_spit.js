import {Game} from "../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT, EQUIPMENT_TYPE,} from "../../enums";

export class AbyssalSpit {
    constructor() {
        this.texture = Game.resources["src/images/magic/abyssal_spit.png"].texture;
        this.type = MAGIC_TYPE.ABYSSAL_SPIT;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 0;
        this.maxUses = 4;
        this.uses = this.maxUses;
    }

    cast(wielder) {
        return false;
    }
}