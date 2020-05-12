import {Game} from "../../../game";
import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {getPlayerOnTile, isEnemy, isNotAWall, isObelisk} from "../../../map_checks";
import {createPlayerAttackTile, createSpikeAnimation, rotate} from "../../../animations";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";

export class Spikes extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_spikes.png"];
        this.type = MAGIC_TYPE.SPIKES;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 2;
        this.friendlyFire = 1;
        this.uses = this.maxUses = 4;
        this.name = "Spikes";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (let offset = -2; offset <= 2; offset++) {
            for (let sign = -1; sign <= 1; sign += 2) {
                const attackTile = {x: wielder.tilePosition.x + offset, y: wielder.tilePosition.y + offset * sign};
                if (offset !== 0 && isNotAWall(attackTile.x, attackTile.y)) {
                    if (isEnemy(attackTile.x, attackTile.y)) {
                        Game.map[attackTile.y][attackTile.x].entity.damage(wielder, this.atk, attackTile.x - wielder.tilePosition.x, attackTile.y - wielder.tilePosition.y, true);
                    } else if (isObelisk(attackTile.x, attackTile.y)) {
                        Game.map[attackTile.y][attackTile.x].entity.damage();
                    }
                    const player = getPlayerOnTile(attackTile.x, attackTile.y);
                    if (player) player.damage(this.friendlyFire, wielder);
                    createPlayerAttackTile(attackTile, 12);
                }
            }
        }
        this.createAttackAnimation(wielder);
        rotate(wielder, false);
        this.uses--;
        return true;
    }

    createAttackAnimation(wielder, color = 0x3d4f8f) {
        createSpikeAnimation(wielder, -2, -2, color);
        createSpikeAnimation(wielder, 2, -2, color);
        createSpikeAnimation(wielder, -2, 2, color);
        createSpikeAnimation(wielder, 2, 2, color);
    }
}