"use strict";

class Petrification {
    constructor() {
        this.texture = Game.resources["src/images/magic/petrification.png"].texture;
        this.type = MAGIC_TYPE.PETRIFICATION;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.atk = 0;
        this.maxUses = 4;
        this.uses = this.maxUses;
    }

    attack(wielder) {

    }
}