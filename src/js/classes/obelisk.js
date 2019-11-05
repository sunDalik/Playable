"use strict";

class Obelisk extends TileElement {
    constructor(tilePositionX, tilePositionY, magic) {
        super(Game.resources["src/images/other/obelisk.png"].texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.OBELISK;
        this.activated = false;
        this.destroyed = false;
        this.timesDonated = 0;
        this.magic1 = magic[0];
        this.magic2 = magic[1];
        this.magic3 = magic[2];
        this.magic4 = magic[3];
        this.grail1 = new Grail(0, 0, this);
        this.grail2 = new Grail(0, 0, this);
        this.grail3 = new Grail(0, 0, this);
        this.grail4 = new Grail(0, 0, this);
    }

    activateObelisk() {
        createFadingText("Choose one...", this.position.x, this.position.y);
    }

    chooseMagic() {
        createFadingText("Goodbye...", this.position.x, this.position.y);
    }

    donate() {
        createFadingText("Be blessed...", this.position.x, this.position.y);
    }

    destroy() {
        createFadingText("Live with it... you will not...", this.position.x, this.position.y);
    }
}