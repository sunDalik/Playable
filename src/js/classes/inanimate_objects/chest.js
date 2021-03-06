import {Game} from "../../game";
import {EQUIPMENT_ID, INANIMATE_TYPE, SLOT} from "../../enums/enums";
import {addKeys, dropItem, removeEquipmentFromPlayer, swapEquipmentWithPlayer} from "../../game_logic";
import * as PIXI from "pixi.js";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import {AnimatedTileElement} from "../tile_elements/animated_tile_element";
import {redrawKeysAmount} from "../../drawing/draw_hud";
import {ItemInanimate} from "./item_inanimate";
import {getRandomChestItem} from "../../utils/pool_utils";
import {AccessoriesSpriteSheet, CommonSpriteSheet, InanimatesSpriteSheet} from "../../loader";
import {runDestroyAnimation} from "../../animations";
import {Key} from "../equipment/key";
import {redrawMiniMapPixel} from "../../drawing/minimap";
import {removeObjectFromArray} from "../../utils/basic_utils";

export class Chest extends ItemInanimate {
    constructor(tilePositionX, tilePositionY, content = undefined) {
        super(InanimatesSpriteSheet["chest.png"], tilePositionX, tilePositionY);
        if (content === undefined) this.contents = getRandomChestItem();
        else this.contents = content;
        this.contentsType = this.contents.equipmentType;
        this.type = INANIMATE_TYPE.CHEST;
        this.opened = false;
        this.createItemSprite(this.contents, this.height * 0.4);
        this.createTextLabel(this.contents, this.height * 1.15);

        this.keysRequiredSprite = new PIXI.Sprite(PIXI.Texture.WHITE, 0, 0);
        this.keysRequiredSprite.anchor.set(0.5, 0.5);
        this.keysRequiredSprite.visible = false;
        this.keysRequiredSprite.position.set(this.position.x, this.position.y - this.height * 0.68);
        this.keysRequiredSprite.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.META;
        Game.world.addChild(this.keysRequiredSprite);

        this.tint = this.contents.rarity.color;
        this.tallModifier = -15;
        this.place();
        this.setScaleModifier(0.9 + this.contents.rarity.num / 16);
        this.keysRequired = this.totalKeysRequired = this.contents.rarity.num + 1;

        if (this.contents.id === EQUIPMENT_ID.HERO_KEY) this.keysRequired--;
        this.heroKeyed = false;

        this.updateKeysRequiredSprite();
        this.cracked = false;
    }

    interact(player) {
        if (this.keysRequired <= 0) this.takeItem(player);
        else if (Game.keysAmount > 0 || this.canBeHeroKeyed(player)) {
            this.consumeKey(player);
            return false;
        }
    }

    takeItem(player) {
        if (this.cracked) this.texture = InanimatesSpriteSheet["chest_opened_cracked.png"];
        else this.texture = InanimatesSpriteSheet["chest_opened.png"];

        if (this.opened) {
            if (this.contents) this.contents = swapEquipmentWithPlayer(player, this.contents);
            else this.contents = removeEquipmentFromPlayer(player, this.contentsType);
        } else {
            this.opened = true;
            this.initAnimations();
        }
        if (this.contents) this.showItem(this.contents);
        else this.hideItem();
    }

    canBeHeroKeyed(player) {
        return !this.heroKeyed && player[SLOT.ACCESSORY] && player[SLOT.ACCESSORY].id === EQUIPMENT_ID.HERO_KEY;
    }

    consumeKey(player) {
        Game.keysAmount--;
        redrawKeysAmount();
        this.keysRequired--;
        const keyElement = new AnimatedTileElement(CommonSpriteSheet["key.png"], player.tilePosition.x, player.tilePosition.y);
        keyElement.removeShadow();
        keyElement.setScaleModifier(0.7);
        const tileStepX = this.tilePosition.x - player.tilePosition.x;
        const tileStepY = this.tilePosition.y - player.tilePosition.y;
        //umm todo refactor angle determination
        if (tileStepX === -1) {
            keyElement.scale.x *= -1;
            keyElement.angle = 45;
        } else if (tileStepX === 1) {
            keyElement.angle = -45;
        } else if (tileStepY === 1) {
            keyElement.angle = 45;
        } else if (tileStepY === -1) {
            keyElement.angle = -135;
        }

        if (this.canBeHeroKeyed(player)) {
            addKeys(1);
            keyElement.texture = AccessoriesSpriteSheet["hero_key.png"];
            keyElement.scale.x *= -1;
            keyElement.angle -= 45;
            if (tileStepX === -1) keyElement.angle += 90;
            keyElement.setScaleModifier(1);
            this.heroKeyed = true;
        }

        keyElement.zIndex = player.zIndex + 1;
        Game.world.addChild(keyElement);
        keyElement.step(tileStepX, tileStepY, null, () => Game.world.removeChild(keyElement));
        this.onUpdate();
        this.updateKeysRequiredSprite();
    }

    onUpdate() {
        if (this.opened) super.onUpdate();
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
        for (let i = 1; i <= this.totalKeysRequired; i++) {
            const keySprite = new PIXI.Sprite(CommonSpriteSheet["key.png"]);
            keySprite.width = keySprite.height = Game.TILESIZE * 0.6;
            if (i > this.keysRequired) {
                keySprite.tint = 0x000000;
            }
            keySprite.position.x = (i - 1) * keySprite.width;
            container.addChild(keySprite);
        }
        this.keysRequiredSprite.texture = Game.app.renderer.generateTexture(container);
    }

    explode() {
        if (this.cracked) {
            this.visible = false;
            this.keysRequiredSprite.visible = false;
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
            redrawMiniMapPixel(this.tilePosition.x, this.tilePosition.y);
            runDestroyAnimation(this);
            this.hideItem();
            if (!this.opened) dropItem(new Key(), this.tilePosition.x, this.tilePosition.y);
            else if (this.contents) dropItem(this.contents, this.tilePosition.x, this.tilePosition.y);
            removeObjectFromArray(this, Game.inanimates);
        } else {
            this.cracked = true;
            if (this.opened) this.texture = InanimatesSpriteSheet["chest_opened_cracked.png"];
            else this.texture = InanimatesSpriteSheet["chest_cracked.png"];
        }
    }
}