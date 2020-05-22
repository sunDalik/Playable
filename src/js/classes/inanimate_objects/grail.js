import {Game} from "../../game";
import {INANIMATE_TYPE, MAGIC_ALIGNMENT} from "../../enums";
import {createFadingText} from "../../animations";
import {removeItemFromPool} from "../../game_changer";
import {GRAIL_TEXT_DARK_FILTER, GRAIL_TEXT_WHITE_FILTER} from "../../filters";
import {InanimatesSpriteSheet} from "../../loader";
import {ItemInanimate} from "./item_inanimate";
import {Light} from "../equipment/magic/light";

export class Grail extends ItemInanimate {
    constructor(tilePositionX, tilePositionY, obelisk) {
        super(InanimatesSpriteSheet["grail.png"], tilePositionX, tilePositionY);
        this.type = INANIMATE_TYPE.GRAIL;
        this.obelisk = obelisk;
        this.magic = null;
        this.tallModifier = -7;
    }

    placeGrail() {
        this.place();
        if (!this.itemSprite) {
            // Light is a placeholder
            this.createItemSprite(new Light());
            this.createTextLabel(new Light());
        }
    }

    interact(player) {
        if (this.magic) {
            this.choose(player);
        }
    }

    setMagic(magic) {
        if (!this.animation) this.initAnimations();
        this.magic = magic;
        if (this.magic) {
            switch (this.magic.alignment) {
                case MAGIC_ALIGNMENT.WHITE:
                    this.textObj.style.strokeThickness = 3;
                    this.textObj.filters = [GRAIL_TEXT_WHITE_FILTER];
                    break;
                case MAGIC_ALIGNMENT.DARK:
                    this.textObj.style.strokeThickness = 2;
                    this.textObj.filters = [GRAIL_TEXT_DARK_FILTER];
                    break;
                case MAGIC_ALIGNMENT.GRAY:
                    this.textObj.style.strokeThickness = 3;
                    this.textObj.filters = [];
                    break;
            }
            this.showItem(magic);
        } else {
            this.hideItem();
        }
    }

    choose(player) {
        if (this.magic &&
            ((this.magic.alignment === MAGIC_ALIGNMENT.WHITE && player === Game.player)
                || (this.magic.alignment === MAGIC_ALIGNMENT.DARK && player === Game.player2)
                || this.magic.alignment === MAGIC_ALIGNMENT.GRAY)
            && (player.magic3 === null || player.magic2 === null || player.magic1 === null)) { //not sure about the last part yet. What to do when the player has no free magic slots?...
            player.giveNewMagic(this.magic);
            removeItemFromPool(this.magic, Game.magicPool);
            this.obelisk.deactivate(this);
        }
        if (this.magic && this.magic.alignment === MAGIC_ALIGNMENT.DARK && player === Game.player) {
            createFadingText("I cannot use dark magic", player.position.x, player.position.y, Game.TILESIZE / 65 * 22, 50);
        } else if (this.magic && this.magic.alignment === MAGIC_ALIGNMENT.WHITE && player === Game.player2) {
            createFadingText("I cannot use white magic", player.position.x, player.position.y, Game.TILESIZE / 65 * 22, 50);
        }
    }

    onUpdate() {
        if (this.magic) super.onUpdate();
        if (this.magic === null) this.filters = [];
    }
}