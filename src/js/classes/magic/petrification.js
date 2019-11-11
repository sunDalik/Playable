import {Game} from "../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT,} from "../../enums";

export class Petrification {
    constructor() {
        this.texture = Game.resources["src/images/magic/petrification.png"].texture;
        this.type = MAGIC_TYPE.PETRIFICATION;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 0;
        this.maxUses = 4;
        this.uses = this.maxUses;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        for (const enemy of Game.enemies) {
            if (!enemy.dead) enemy.stun += 5;
        }
        this.uses--;
    }
}