"use strict";

class Necromancy {
    constructor() {
        this.texture = Game.resources["src/images/magic/necromancy.png"].texture;
        this.type = MAGIC_TYPE.NECROMANCY;
        this.alignment = MAGIC_ALIGNMENT.GRAY;
        this.atk = 0;
        this.maxUses = 1;
        this.uses = this.maxUses;
    }

    cast(wielder) {

    }
}