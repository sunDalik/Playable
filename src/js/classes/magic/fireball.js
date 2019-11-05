"use strict";

class Fireball {
    constructor() {
        this.texture = Game.resources["src/images/magic/fireball.png"].texture;
        this.type = MAGIC_TYPE.FIREBALL;
        this.alignment = MAGIC_ALIGNMENT.GRAY;
        this.atk = 1;
        this.multiplier = 0;
        this.maxUses = 3;
        this.uses = this.maxUses;
    }

    cast(wielder) {

    }
}