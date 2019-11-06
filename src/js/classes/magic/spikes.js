"use strict";

class Spikes {
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
        for (let offset = -2; offset <= 2; offset++) {
            for (let sign = -1; sign <= 1; sign += 2) {
                const attackPositionX = wielder.tilePosition.x + offset;
                const attackPositionY = wielder.tilePosition.y + offset * sign;
                if (offset !== 0 && isNotAWall(attackPositionX, attackPositionY)) {
                    createFadingAttack(new FullTileElement(Game.resources["src/images/player2_attack.png"].texture, attackPositionX, attackPositionY));
                    const tileEntity = Game.map[attackPositionY][attackPositionX].entity;
                    if (tileEntity !== null && tileEntity.role === ROLE.ENEMY) {
                        tileEntity.damage(this.atk, 0, 0, true);
                    }
                    const player = getPlayerOnTile(attackPositionX, attackPositionY);
                    if (player !== null) {
                        player.damage(this.friendlyFire);
                    }
                }
            }
        }
        rotate(wielder, false);
        this.uses--;
    }
}