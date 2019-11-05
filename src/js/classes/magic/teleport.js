"use strict";

class Teleport {
    constructor() {
        this.texture = Game.resources["src/images/magic/teleport.png"].texture;
        this.type = MAGIC_TYPE.TELEPORT;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 0;
        this.maxUses = 6;
        this.uses = this.maxUses;
    }

    attack(wielder) {

    }
}