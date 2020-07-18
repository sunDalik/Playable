import {EQUIPMENT_TYPE, INANIMATE_TYPE} from "../../enums/enums";
import {removeEquipmentFromPlayer, swapEquipmentWithPlayer} from "../../game_logic";
import {ItemInanimate} from "./item_inanimate";
import {Game} from "../../game";
import {redrawKeysAmount} from "../../drawing/draw_hud";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";
import * as PIXI from "pixi.js";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import {CommonSpriteSheet} from "../../loader";

export class ShopStand extends ItemInanimate {
    constructor(tilePositionX, tilePositionY, contents) {
        super(Game.resources["src/images/inanimates/shop_stand.png"].texture, tilePositionX, tilePositionY, true);
        this.contents = contents;
        this.contentsType = contents.equipmentType;
        this.bought = false;
        this.type = INANIMATE_TYPE.SHOP_STAND;
        this.createItemSprite(contents, this.height * 0.7);
        this.createTextLabel(contents, this.height * 1.4);
        this.setScaleModifier(0.8);

        this.keysRequiredSprite = new PIXI.Sprite(PIXI.Texture.WHITE, 0, 0);
        this.keysRequiredSprite.anchor.set(0.5, 0.5);
        this.keysRequiredSprite.visible = false;
        this.keysRequiredSprite.position.set(this.position.x, this.position.y + this.height * 0.10);
        this.keysRequiredSprite.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.META;
        Game.world.addChild(this.keysRequiredSprite);
        if (this.contentsType === EQUIPMENT_TYPE.BAG_ITEM) {
            this.keysRequired = 1;
        } else {
            this.keysRequired = this.contents.rarity.num + 2;
        }
        this.updateKeysRequiredSprite();
    }

    immediateReaction() {
        this.itemSprite.visible = true;
    }

    afterMapGen() {
        this.initAnimations();
        this.showItem(this.contents);
        this.itemSprite.visible = false;
    }

    interact(player) {
        if (this.bought || this.buy()) {
            this.takeItem(player);
        }
    }

    buy() {
        if (Game.keysAmount >= this.keysRequired) {
            Game.keysAmount -= this.keysRequired;
            redrawKeysAmount();
            this.bought = true;
            Game.world.removeChild(this.keysRequiredSprite);
            return true;
        } else {
            return false;
        }
    }

    takeItem(player) {
        if (this.contents) this.contents = swapEquipmentWithPlayer(player, this.contents);
        else this.contents = removeEquipmentFromPlayer(player, this.contentsType);
        if (this.contents) this.showItem(this.contents);
        else this.hideItem();
    }

    onUpdate() {
        super.onUpdate();
        this.keysRequiredSprite.visible = false;
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) !== null) {
                if (this.keysRequired > 0) this.keysRequiredSprite.visible = true;
                break;
            }
        }
    }

    updateKeysRequiredSprite() {
        if (this.keysRequiredSprite.texture !== PIXI.Texture.WHITE) this.keysRequiredSprite.texture.destroy();
        const container = new PIXI.Container();
        for (let i = 1; i <= this.keysRequired; i++) {
            const keySprite = new PIXI.Sprite(CommonSpriteSheet["key.png"]);
            keySprite.width = keySprite.height = Game.TILESIZE * 0.52;
            keySprite.position.x = (i - 1) * keySprite.width * 0.7;
            container.addChild(keySprite);
        }
        this.keysRequiredSprite.texture = Game.app.renderer.generateTexture(container);
    }
}