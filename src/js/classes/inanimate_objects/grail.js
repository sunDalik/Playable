import {Game} from "../../game"
import {INANIMATE_TYPE, MAGIC_ALIGNMENT, ROLE} from "../../enums";
import {createFadingText, createFloatingItemAnimation} from "../../animations";
import {TileElement} from "../tile_elements/tile_element";
import {removeItemFromPool} from "../../game_changer";
import {
    ITEM_OUTLINE_FILTER_SMALL,
    ITEM_OUTLINE_FILTER_SMALL_BLACK,
    ITEM_OUTLINE_FILTER_SMALL_GRAY
} from "../../filters";

export class Grail extends TileElement {
    constructor(tilePositionX, tilePositionY, obelisk) {
        super(Game.resources["src/images/other/grail.png"].texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.GRAIL;
        this.obelisk = obelisk;
        this.magic = null;
        this.magicSet = false;
        //just some default texture
        this.magicSprite = new TileElement(Game.resources["src/images/magic/aura.png"].texture, 0, 0);
        this.magicSprite.scaleModifier = 0.8;
        this.magicSprite.fitToTile();
        this.magicSprite.visible = false;
        this.magicSprite.zIndex = Game.primaryPlayer.zIndex + 1;
        Game.world.addChild(this.magicSprite);
    }

    placeGrail() {
        this.place();
        this.magicSprite.tilePosition.set(this.tilePosition.x, this.tilePosition.y - 0.28);
        this.magicSprite.place();
    }

    setMagic(magic) {
        this.magic = magic;
        if (this.magic) {
            switch (this.magic.alignment) {
                case MAGIC_ALIGNMENT.WHITE:
                    this.magicSprite.filters = [ITEM_OUTLINE_FILTER_SMALL];
                    break;
                case MAGIC_ALIGNMENT.DARK:
                    this.magicSprite.filters = [ITEM_OUTLINE_FILTER_SMALL_BLACK];
                    break;
                case MAGIC_ALIGNMENT.GRAY:
                    this.magicSprite.filters = [ITEM_OUTLINE_FILTER_SMALL_GRAY];
                    break;
            }
            if (!this.magicSet) {
                this.magicSet = true;
                this.animation = createFloatingItemAnimation(this.magicSprite);
            }
            Game.app.ticker.remove(this.magicSprite.animation);
            Game.app.ticker.add(this.magicSprite.animation);
            this.magicSprite.texture = this.magic.texture;
            this.magicSprite.visible = true;
        } else {
            Game.app.ticker.remove(this.magicSprite.animation);
            this.magicSprite.visible = false;
            this.texture = Game.resources["src/images/other/grail.png"].texture;
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
            createFadingText("I cannot use dark magic", player.position.x, player.position.y, Game.TILESIZE / 65 * 22, 60);
        } else if (this.magic && this.magic.alignment === MAGIC_ALIGNMENT.WHITE && player === Game.player2) {
            createFadingText("I cannot use white magic", player.position.x, player.position.y, Game.TILESIZE / 65 * 22, 60);
        }
    }

    onUpdate() {
        if (this.magic === null) {
            //no highlight
            this.filters = [];
        }
    }
}