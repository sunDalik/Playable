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
import * as PIXI from "pixi.js";
import {HUDTextStyle} from "../../drawing/draw_constants";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";

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

        this.textObj = new PIXI.Text("", Object.assign({}, HUDTextStyle, {fontSize: Game.TILESIZE / 3.2}));
        this.textObj.anchor.set(0.5, 0.5);
        this.textObj.visible = false;
        this.textObj.zIndex = 99;
    }

    placeGrail() {
        this.place();
        this.magicSprite.tilePosition.set(this.tilePosition.x, this.tilePosition.y - 0.28);
        this.magicSprite.place();
    }

    setMagic(magic) {
        this.magic = magic;
        if (this.magic) {
            this.textObj.text = this.magic.name;
            Game.world.addChild(this.textObj);
        } else this.textObj.text = "";

        Game.app.ticker.remove(this.animation);
        Game.app.ticker.remove(this.textObj.animation);
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
                this.textObj.animation = createFloatingItemAnimation(this.textObj);
                Game.app.ticker.remove(this.animation);
                Game.app.ticker.remove(this.textObj.animation);
            }
            Game.app.ticker.add(this.animation);
            Game.app.ticker.add(this.textObj.animation);
            this.magicSprite.texture = this.magic.texture;
            this.magicSprite.visible = true;
        } else {
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
            this.filters = [];
        }
        this.textObj.visible = false;
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) !== null) {
                this.textObj.visible = true;
                this.textObj.position.set(this.position.x, this.position.y - this.height);
                break;
            }
        }
    }
}