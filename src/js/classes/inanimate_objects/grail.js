import {Game} from "../../game"
import {INANIMATE_TYPE, MAGIC_ALIGNMENT, ROLE} from "../../enums";
import {createFadingText, createFloatingItemAnimation} from "../../animations";
import {TileElement} from "../tile_elements/tile_element";
import {removeItemFromPool} from "../../game_changer";
import * as PIXI from "pixi.js";
import {getInanimateItemLabelTextStyle} from "../../drawing/draw_constants";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";
import {GRAIL_TEXT_DARK_FILTER, GRAIL_TEXT_WHITE_FILTER} from "../../filters";
import {InanimatesSpriteSheet, MagicSpriteSheet} from "../../loader";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";

export class Grail extends TileElement {
    constructor(tilePositionX, tilePositionY, obelisk) {
        super(InanimatesSpriteSheet["grail.png"], tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.GRAIL;
        this.obelisk = obelisk;
        this.magic = null;
        this.magicSet = false;
        this.magicSprite = new TileElement(MagicSpriteSheet["aura.png"], 0, 0);
        this.magicSprite.setScaleModifier(0.8);
        this.magicSprite.visible = false;
        this.magicSprite.zIndex = getZIndexForLayer(this.tilePosition.y) + 1;
        Game.world.addChild(this.magicSprite);

        this.textObj = new PIXI.Text("", getInanimateItemLabelTextStyle());
        this.textObj.anchor.set(0.5, 0.5);
        this.textObj.visible = false;
        this.textObj.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.META;
    }

    placeGrail() {
        this.place();
        this.magicSprite.tilePosition.set(this.tilePosition.x, this.tilePosition.y - 0.28);
        this.magicSprite.place();
    }

    interact(player) {
        if (this.magic) {
            this.choose(player);
        }
    }

    setMagic(magic) {
        this.magic = magic;
        if (this.magic) {
            this.textObj.text = this.magic.name;
            this.textObj.style.fill = this.magic.rarity.color;
            Game.world.addChild(this.textObj);
        } else this.textObj.text = "";

        Game.app.ticker.remove(this.animation);
        Game.app.ticker.remove(this.textObj.animation);
        if (this.magic) {
            this.textObj.style.strokeThickness = 3;
            switch (this.magic.alignment) {
                case MAGIC_ALIGNMENT.WHITE:
                    //todo: fill with rarity color when you implement rarity
                    //this.textObj.style.fill = 0xffecb0;
                    this.textObj.filters = [GRAIL_TEXT_WHITE_FILTER];
                    break;
                case MAGIC_ALIGNMENT.DARK:
                    //this.textObj.style.fill = 0xffecb0;
                    this.textObj.style.strokeThickness = 2;
                    this.textObj.filters = [GRAIL_TEXT_DARK_FILTER];
                    break;
                case MAGIC_ALIGNMENT.GRAY:
                    //this.textObj.style.fill = 0xffecb0;
                    this.textObj.filters = [];
                    break;
            }
            if (!this.magicSet) {
                this.magicSet = true;
                this.animation = createFloatingItemAnimation(this.magicSprite);
                this.textObj.position.set(this.position.x, this.position.y - this.height * 5 / 6);
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
            this.texture = InanimatesSpriteSheet["grail.png"];
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
        if (this.magic === null) {
            this.filters = [];
        }
        this.textObj.visible = false;
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) !== null) {
                this.textObj.visible = true;
                break;
            }
        }
    }
}