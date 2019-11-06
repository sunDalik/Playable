"use strict";

class Aura {
    constructor() {
        this.texture = Game.resources["src/images/magic/aura.png"].texture;
        this.type = MAGIC_TYPE.AURA;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 2;
        this.healAmount = 1;
        this.maxUses = 3;
        this.uses = this.maxUses;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                const attackPositionX = wielder.tilePosition.x + x;
                const attackPositionY = wielder.tilePosition.y + y;
                if (!(x === 0 && y === 0) && isNotAWall(attackPositionX, attackPositionY)) {
                    createFadingAttack(new FullTileElement(Game.resources["src/images/player_attack.png"].texture, attackPositionX, attackPositionY));
                    const tileEntity = Game.map[attackPositionY][attackPositionX].entity;
                    if (tileEntity !== null && tileEntity.role === ROLE.ENEMY) {
                        tileEntity.damage(this.atk, 0, 0, true);
                    }
                    const player = getPlayerOnTile(attackPositionX, attackPositionY);
                    if (player !== null) {
                        player.heal(this.healAmount);
                    }
                }
            }
        }
        rotate(wielder, true);
        this.uses--;
    }
}