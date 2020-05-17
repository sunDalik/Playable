import {Game} from "../../../game";
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY} from "../../../enums";
import {isEnemy, isLit, isNotAWall} from "../../../map_checks";
import {DarkPoisonHazard} from "../../hazards/poison";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {randomShuffle} from "../../../utils/random_utils";

export class AbyssalSpit extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_abyssal_spit.png"];
        this.type = MAGIC_TYPE.ABYSSAL_SPIT;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 0;
        this.uses = this.maxUses = 5;
        this.range = 4;
        this.name = "Abyssal Spit";
        this.description = "EDIT";
        this.rarity = RARITY.C;
    }

    //todo: dont draw unusable key bindings while charging
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

    release(wielder, dirX, dirY) {
        if (dirX === 0 && dirY === 0) return false;
        wielder.cancelAnimation();
        wielder.bump(dirX, dirY);
        this.uses--;
        for (let i = 1; ; i++) {
            if (isNotAWall(wielder.tilePosition.x + dirX * i, wielder.tilePosition.y + dirY * i)) {
                Game.world.addHazard(new DarkPoisonHazard(wielder.tilePosition.x + dirX * i, wielder.tilePosition.y + dirY * i));
            } else break;
        }
        return true;
    }
}