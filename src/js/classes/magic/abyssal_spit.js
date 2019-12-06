import {Game} from "../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT, EQUIPMENT_TYPE,} from "../../enums";
import {isNotAWall} from "../../map_checks";
import {addHazardToWorld} from "../../game_logic";
import {DarkPoisonHazard} from "../hazards/dark_poison";

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
        if (this.uses <= 0) return false;
        if (!wielder.charging) {
            wielder.shake(1, 0);
            wielder.chargingMagic = this;
            wielder.charging = true;
            wielder.cancellable = false;
        }
        return false;
    }

    release(wielder, stepX, stepY) {
        if (stepX === 0 && stepY === 0) return false;
        wielder.cancelAnimation();
        wielder.bump(stepX, stepY);
        this.uses--;
        for (let i = 1; ; i++) {
            if (isNotAWall(wielder.tilePosition.x + stepX * i, wielder.tilePosition.y + stepY * i)) {
                addHazardToWorld(new DarkPoisonHazard(wielder.tilePosition.x + stepX * i, wielder.tilePosition.y + stepY * i));
            } else break;
        }
        return true;
    }
}