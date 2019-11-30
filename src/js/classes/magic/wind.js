import {Game} from "../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT, EQUIPMENT_TYPE,} from "../../enums";

export class Wind {
    constructor() {
        this.texture = Game.resources["src/images/magic/wind.png"].texture;
        this.type = MAGIC_TYPE.WIND;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 0;
        this.maxUses = 5;
        this.uses = this.maxUses;
    }

    cast(wielder) {
        return false;
    }
}