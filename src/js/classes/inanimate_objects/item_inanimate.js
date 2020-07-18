import {TileElement} from "../tile_elements/tile_element";
import {ROLE} from "../../enums/enums";
import {Game} from "../../game";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import * as PIXI from "pixi.js";
import {HUDTextStyle} from "../../drawing/draw_constants";
import {createFloatingItemAnimation} from "../../animations";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";
import {ENCHANTMENT_TYPE} from "../../enums/equipment_modifiers";
import {getItemLabelColor} from "../../game_logic";
import {DIVINE_FILTER, ITEM_OUTLINE_FILTER} from "../../filters";

const itemSize = Game.TILESIZE * 0.9;

export class ItemInanimate extends TileElement {
    constructor(texture, tilePositionX, tilePositionY, keepInside = false) {
        super(texture, tilePositionX, tilePositionY, keepInside);
        this.role = ROLE.INANIMATE;
    }

    createItemSprite(item, offsetY = this.height / 2) {
        this.itemSprite = new PIXI.Sprite(item.texture);
        this.itemSprite.anchor.set(0.5, 0.5);
        this.itemSprite.position.set(this.position.x, this.position.y - offsetY);
        this.recalculateSize();
        this.itemSprite.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.META;
        this.itemSprite.visible = false;
        this.itemSprite.alpha = 0.35;
        Game.world.addChild(this.itemSprite);
    }

    createTextLabel(item, offsetY = this.height * 5 / 4) {
        this.textObj = new PIXI.Text(item.name, Object.assign({}, HUDTextStyle, {
            fontSize: Game.TILESIZE / 3.3,
            strokeThickness: 3
        }));
        this.textObj.style.fill = getItemLabelColor(item);
        this.textObj.anchor.set(0.5, 0.5);
        this.textObj.position.set(this.position.x, this.position.y - offsetY);
        this.textObj.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.META;
        this.textObj.visible = false;
        this.textObj.alpha = 0.35;
        Game.world.addChild(this.textObj);
    }

    showItem(item) {
        this.itemSprite.alpha = this.textObj.alpha = 1;
        this.itemSprite.visible = this.textObj.visible = true;
        this.recalculateSize();
        this.itemSprite.texture = item.texture;
        if (item.enchantment === ENCHANTMENT_TYPE.DIVINE) {
            this.itemSprite.filters = [ITEM_OUTLINE_FILTER, DIVINE_FILTER];
        } else {
            this.itemSprite.filters = [];
        }

        this.textObj.text = item.name;
        this.textObj.style.fill = getItemLabelColor(item);
        this.playAnimation();
        this.onUpdate();
    }

    recalculateSize() {
        if (false && this.itemSprite.texture.trim) {
            const mul = this.itemSprite.texture.trim.width > this.itemSprite.texture.trim.height ?
                this.itemSprite.texture.width / this.itemSprite.texture.trim.width
                : this.itemSprite.texture.height / this.itemSprite.texture.trim.height;
            this.itemSprite.width = this.itemSprite.height = itemSize * mul;
        } else {
            this.itemSprite.width = this.itemSprite.height = itemSize;
        }
    }

    hideItem() {
        this.itemSprite.visible = false;
        this.textObj.text = "";
        this.stopAnimation();
    }

    initAnimations() {
        this.animation = createFloatingItemAnimation(this.itemSprite);
        this.textObj.animation = createFloatingItemAnimation(this.textObj);
    }

    stopAnimation() {
        Game.app.ticker.remove(this.animation);
        Game.app.ticker.remove(this.textObj.animation);
    }

    playAnimation() {
        this.stopAnimation();
        Game.app.ticker.add(this.animation);
        Game.app.ticker.add(this.textObj.animation);
    }

    onUpdate() {
        this.textObj.visible = false;
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) !== null) {
                this.textObj.visible = true;
                break;
            }
        }
    }
}