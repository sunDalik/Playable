import {Game} from "../game"
import {FullTileElement} from "./full_tile_element";
import {ROLE, INANIMATE_TYPE} from "../enums";
import {Grail} from "./grail";
import {createFadingText, longShakeScreen} from "../animations";

export class Obelisk extends FullTileElement {
    constructor(tilePositionX, tilePositionY, magic) {
        super(Game.resources["src/images/other/obelisk.png"].texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.OBELISK;
        this.activated = false;
        this.working = true;
        this.timesDamaged = 0;
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

    placeGrails() {
        for (const grail of [this.grail1, this.grail2, this.grail3, this.grail4]) {
            grail.placeGrail();
        }
    }

    activate() {
        if (!this.activated && this.working) {
            this.grail1.setMagic(this.magic1);
            this.grail2.setMagic(this.magic2);
            this.activated = true;
            createFadingText("Choose one...", this.position.x, this.position.y);
            longShakeScreen();
        }
    }

    deactivate() {
        if (this.working && this.activated) {
            this.working = false;
            if (this.timesDamaged > 0) this.texture = Game.resources["src/images/other/obelisk_used_damaged.png"].texture;
            else this.texture = Game.resources["src/images/other/obelisk_used.png"].texture;
            this.grail1.setMagic(null);
            this.grail2.setMagic(null);
            this.grail3.setMagic(null);
            this.grail4.setMagic(null);
            createFadingText("Goodbye...", this.position.x, this.position.y);
            longShakeScreen();
        }
    }

    donate(player) {
        if (this.working && this.activated) {
            if (this.timesDonated < 2) {
                if (player.health > 1) {
                    player.health -= 1;
                    this.timesDonated++;
                    if (this.timesDonated === 1) this.grail3.setMagic(this.magic3);
                    else this.grail4.setMagic(this.magic4);
                    createFadingText("Be blessed...", this.position.x, this.position.y);
                    longShakeScreen();
                } else {
                    createFadingText("Your offer is fictitious...", this.position.x, this.position.y);
                }
            } else {
                createFadingText("Choose one...", this.position.x, this.position.y);
            }
        }
    }

    destroy() {
        if (this.working) {
            this.working = false;
            this.texture = Game.resources["src/images/other/obelisk_broken.png"].texture;
            createFadingText("Live with it... you will not...", this.position.x, this.position.y);
        }
    }

    damage() {
        if (this.working) {
            if (this.timesDamaged >= 1) this.destroy();
            else {
                this.timesDamaged++;
                this.texture = Game.resources["src/images/other/obelisk_damaged.png"].texture;
                createFadingText("Don't", this.position.x, this.position.y);
            }
        }
    }
}