import {Game} from "../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT,} from "../../enums";
import {isNotAWall, getPlayerOnTile, isEnemy} from "../../mapChecks";
import {createFadingAttack, rotate} from "../../animations";
import {FullTileElement} from "../full_tile_element";

export class Spikes {
    constructor() {
        this.texture = Game.resources["src/images/magic/spikes.png"].texture;
        this.type = MAGIC_TYPE.SPIKES;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 2;
        this.friendlyFire = 1;
        this.maxUses = 5;
        this.uses = this.maxUses;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (let offset = -2; offset <= 2; offset++) {
            for (let sign = -1; sign <= 1; sign += 2) {
                const attackPositionX = wielder.tilePosition.x + offset;
                const attackPositionY = wielder.tilePosition.y + offset * sign;
                if (offset !== 0 && isNotAWall(attackPositionX, attackPositionY)) {
                    createFadingAttack(new FullTileElement(Game.resources["src/images/player2_attack.png"].texture, attackPositionX, attackPositionY));
                    if (isEnemy(attackPositionX, attackPositionY)) {
                        Game.map[attackPositionY][attackPositionX].entity.damage(this.atk, 0, 0, true);
                    }
                    const player = getPlayerOnTile(attackPositionX, attackPositionY);
                    if (player) player.damage(this.friendlyFire, wielder);
                }
            }
        }
        rotate(wielder, false);
        this.uses--;
    }
}