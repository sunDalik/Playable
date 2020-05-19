import {Game} from "../../../game";
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY} from "../../../enums";
import {isAnyWall} from "../../../map_checks";
import {DarkPoisonHazard} from "../../hazards/poison";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class AbyssalSpit extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_abyssal_spit.png"];
        this.type = MAGIC_TYPE.ABYSSAL_SPIT;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 0;
        this.uses = this.maxUses = 5;
        this.range = 4;
        this.name = "Abyssal Spit";
        this.description = "Spit out a huge pool of dark poison in a given direction\nDark poison damages both players and enemies";
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

        let endI = this.range;
        for (let i = 1; i <= endI; i++) {
            let tile = {x: wielder.tilePosition.x + dirX * i, y: wielder.tilePosition.y + dirY * i};
            if (isAnyWall(tile.x, tile.y)) endI = i;
            Game.world.addHazard(new DarkPoisonHazard(tile.x, tile.y));

            const endJ = i === 4 ? 2 : i - 1;
            for (const sign of [-1, 1]) {
                for (let j = 1; j <= endJ; j++) {
                    tile = dirX !== 0 ? {x: wielder.tilePosition.x + dirX * i, y: wielder.tilePosition.y + j * sign}
                        : {x: wielder.tilePosition.x + j * sign, y: wielder.tilePosition.y + dirY * i};

                    if (isAnyWall(tile.x, tile.y)) break;
                    Game.world.addHazard(new DarkPoisonHazard(tile.x, tile.y));
                }
            }
        }
        return true;
    }
}