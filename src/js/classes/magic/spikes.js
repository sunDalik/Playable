"use strict";

class Spikes {
    constructor() {
        this.texture = Game.resources["src/images/magic/spikes.png"].texture;
        this.type = MAGIC_TYPE.SPIKES;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 2;
        this.maxUses = 5;
        this.uses = this.maxUses;
    }

    attack(wielder) {

    }
}