import {Game} from "../../game"
import {INANIMATE_TYPE, ROLE} from "../../enums";
import {createFloatingItemAnimation} from "../../animations";
import {removeEquipmentFromPlayer, swapEquipmentWithPlayer} from "../../game_logic";
import {TileElement} from "../tile_elements/tile_element";
import * as PIXI from "pixi.js";
import {getInanimateItemLabelTextStyle} from "../../drawing/draw_constants";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";

export class Chest extends TileElement {
    constructor(tilePositionX, tilePositionY, contents) {
        super(Game.resources["src/images/inanimates/chest.png"].texture, tilePositionX, tilePositionY);
        this.contents = contents;
        this.contentsType = contents.equipmentType;
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.CHEST;
        this.opened = false;
        this.contentsSprite = new TileElement(this.contents.texture, this.tilePosition.x, this.tilePosition.y - 1, true);
        this.contentsSprite.width = Game.TILESIZE * 0.9;
        this.contentsSprite.height = Game.TILESIZE * 0.9;
        this.contentsSprite.setScaleModifier(0.8);
        this.contentsSprite.visible = false;
        this.contentsSprite.zIndex = getZIndexForLayer(this.tilePosition.y) + 1;
        Game.world.addChild(this.contentsSprite);

        this.textObj = new PIXI.Text(this.contents.name, getInanimateItemLabelTextStyle());
        this.textObj.anchor.set(0.5, 0.5);
        this.textObj.position.set(this.position.x, this.position.y - this.height * 5 / 4);
        this.textObj.visible = false;
        this.textObj.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.META;
        Game.world.addChild(this.textObj);

        this.tint = contents.rarity.color;
        this.tallModifier = -15;
        this.setScaleModifier(0.9 + contents.rarity.num / 16);
    }

    interact(player) {
        this.texture = Game.resources["src/images/inanimates/chest_opened.png"].texture;
        if (this.opened) {
            if (this.contents) this.contents = swapEquipmentWithPlayer(player, this.contents);
            else this.contents = removeEquipmentFromPlayer(player, this.contentsType);
        } else {
            this.opened = true;
            this.animation = createFloatingItemAnimation(this.contentsSprite);
            this.textObj.animation = createFloatingItemAnimation(this.textObj);
        }

        Game.app.ticker.remove(this.animation);
        Game.app.ticker.remove(this.textObj.animation);
        if (this.contents) {
            Game.app.ticker.add(this.animation);
            Game.app.ticker.add(this.textObj.animation);
            this.textObj.text = this.contents.name;
            this.textObj.style.fill = this.contents.rarity.color;
            this.contentsSprite.texture = this.contents.texture;
            this.contentsSprite.width = Game.TILESIZE * 0.9;
            this.contentsSprite.height = Game.TILESIZE * 0.9;
            this.contentsSprite.visible = true;
            this.textObj.visible = true;
        } else {
            this.textObj.text = "";
            this.contentsSprite.visible = false;
        }
    }

    onUpdate() {
        this.textObj.visible = false;
        if (this.opened) {
            for (const dir of getCardinalDirections()) {
                if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) !== null) {
                    this.textObj.visible = true;
                    break;
                }
            }
        }
    }
}