import {Game} from "../../game";
import {EQUIPMENT_ID, INANIMATE_TYPE, MAGIC_ALIGNMENT} from "../../enums";
import {createFadingText} from "../../animations";
import {removeItemFromPool} from "../../game_changer";
import {GRAIL_TEXT_DARK_FILTER, GRAIL_TEXT_WHITE_FILTER} from "../../filters";
import {InanimatesSpriteSheet} from "../../loader";
import {ItemInanimate} from "./item_inanimate";
import {Light} from "../equipment/magic/light";
import {otherPlayer} from "../../utils/game_utils";

export class Grail extends ItemInanimate {
    constructor(tilePositionX, tilePositionY, obelisk) {
        super(InanimatesSpriteSheet["grail.png"], tilePositionX, tilePositionY);
        this.type = INANIMATE_TYPE.GRAIL;
        this.obelisk = obelisk;
        this.magic = null;
        this.tallModifier = -7;
    }

    initGrail() {
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
            && ((this.magic.constructor.requiredMagic === null && (player.magic3 === null || player.magic2 === null || player.magic1 === null))
                || player.getMagicByConstructor(this.magic.constructor.requiredMagic) !== null)) {
            player.giveNewMagic(this.magic);
            removeItemFromPool(this.magic, Game.magicPool);
            this.obelisk.deactivate(this);
        }
        if (this.magic) {
            if (this.magic.id === EQUIPMENT_ID.NECROMANCY && otherPlayer(player).dead) {
                this.magic.cast(player);
                removeItemFromPool(this.magic, Game.magicPool);
                this.obelisk.deactivate(this);
            } else {
                let errorMessage = "";
                if (this.magic.alignment === MAGIC_ALIGNMENT.DARK && player === Game.player) {
                    errorMessage = "I cannot use dark magic";
                } else if (this.magic.alignment === MAGIC_ALIGNMENT.WHITE && player === Game.player2) {
                    errorMessage = "I cannot use light magic";
                } else if (this.magic.constructor.requiredMagic !== null && player.getMagicByConstructor(this.magic.constructor.requiredMagic) === null) {
                    errorMessage = "I don't have a required magic";
                } else if (player.magic1 !== null && player.magic2 !== null && player.magic3 !== null) {
                    errorMessage = "I have exhausted my magic capacity";
                }
                if (errorMessage !== "") {
                    createFadingText(errorMessage, player.position.x, player.position.y, Game.TILESIZE / 65 * 22, 50);
                }
            }
        }
    }

    onUpdate() {
        if (this.magic) super.onUpdate();
        if (this.magic === null) this.filters = [];
    }
}