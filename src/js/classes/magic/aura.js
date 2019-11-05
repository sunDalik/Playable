"use strict";

class Aura {
    constructor() {
        this.texture = Game.resources["src/images/magic/aura.png"].texture;
        this.type = MAGIC_TYPE.AURA;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 2;
        this.maxUses = 3;
        this.uses = this.maxUses;
    }

    attack(wielder) {

    }
}