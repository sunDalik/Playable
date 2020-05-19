import {Game} from "../../../game";
import {HAZARD_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {isEnemy} from "../../../map_checks";
import {blowAwayInDirection} from "../../../special_move_logic";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class Wind extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_wind.png"];
        this.type = MAGIC_TYPE.WIND;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.radius = 4;
        this.slideTime = 5;
        this.uses = this.maxUses = 4;
        this.name = "Wind";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (let r = this.radius; r >= 0; r--) {
            for (let x = -this.radius; x <= this.radius; x++) {
                for (let y = -this.radius; y <= this.radius; y++) {
                    if (Math.abs(x) + Math.abs(y) === r) {
                        const hazard = Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].hazard;
                        if (hazard && (hazard.type === HAZARD_TYPE.FIRE || hazard.type === HAZARD_TYPE.DARK_FIRE)) {
                            hazard.extinguish();
                        }
                        if (isEnemy(wielder.tilePosition.x + x, wielder.tilePosition.y + y)) {
                            Game.map[wielder.tilePosition.y + y][wielder.tilePosition.x + x].entity.stun++;
                            blowAwayInDirection(wielder.tilePosition, {x: x, y: y}, this.slideTime);
                        }
                    }
                }
            }
        }
        this.uses--;
        return true;
    }
}