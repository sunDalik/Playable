import {Game} from "../../game"
import {EQUIPMENT_TYPE, INANIMATE_TYPE} from "../../enums";
import * as PIXI from "pixi.js";
import {removeEquipmentFromPlayer, swapEquipmentWithPlayer} from "../../game_logic";
import {InanimatesSpriteSheet} from "../../loader";
import {ItemInanimate} from "./item_inanimate";

export const statueLeftHandPoint = {x: 195, y: 200};
export const statueRightHandPoint = {x: 65, y: 108};

export class Statue extends ItemInanimate {
    constructor(tilePositionX, tilePositionY, weapon) {
        super(InanimatesSpriteSheet["statue.png"], tilePositionX, tilePositionY);
        this.weapon = weapon;
        this.type = INANIMATE_TYPE.STATUE;
        this.marauded = false;
        this.customTexture = false;
        this.tallModifier = -10;
        this.createItemSprite(weapon);
        this.createTextLabel(weapon, this.height * 3 / 5);
        this.destroyItemSprite();
    }

    afterMapGen() {
        this.updateTexture();
        this.onUpdate();
    }

    fitToTile() {
        if (this.initialScale) {
            this.scale.set(this.initialScale.x, this.initialScale.y);
        } else {
            super.fitToTile();
            this.initialScale = {x: this.scale.x, y: this.scale.y};
        }
    }

    updateTexture() {
        const container = new PIXI.Container();
        container.sortableChildren = true;
        const statue = new PIXI.Sprite(InanimatesSpriteSheet["statue.png"]);
        container.addChild(statue);
        const hands = new PIXI.Sprite(InanimatesSpriteSheet["statue_hands.png"]);
        hands.zIndex = statue.zIndex + 2;
        container.addChild(hands);
        if (this.weapon && this.weapon.getStatuePlacement) {
            const weapon = new PIXI.Sprite(this.weapon.texture);
            let weapon2;

            const applyPlacement = (weapon, placement) => {
                weapon.anchor.set(0.5, 0.5);
                if (placement.texture) weapon.texture = placement.texture;
                weapon.scale.x = weapon.scale.y = statue.width / weapon.width * placement.scaleModifier;
                if (placement.mirrorX) weapon.scale.x *= -1;
                weapon.position.set(placement.x, placement.y);
                weapon.angle = placement.angle;
                if (placement.zIndex) weapon.zIndex = placement.zIndex;
                else weapon.zIndex = hands.zIndex - 1;
                container.addChild(weapon);
            };

            applyPlacement(weapon, this.weapon.getStatuePlacement());
            if (this.weapon.getStatuePlacement().secondWeapon) {
                weapon2 = new PIXI.Sprite(this.weapon.texture);
                applyPlacement(weapon2, this.weapon.getStatuePlacement().secondWeapon);
            }

            //sorry this is super messy
            let leftDiff = Math.max(0 - (weapon.position.x - weapon.width / 2), 0);
            let rightDiff = Math.max((weapon.position.x + weapon.width / 2) - statue.width, 0);
            let upDiff = Math.max(0 - (weapon.position.y - weapon.height / 2), 0);
            let bottomDiff = Math.max((weapon.position.y + weapon.height / 2) - statue.height, 0);
            if (weapon2) {
                leftDiff = Math.max(leftDiff, 0 - (weapon2.position.x - weapon2.width / 2));
                rightDiff = Math.max(rightDiff, (weapon2.position.x + weapon2.width / 2) - statue.width);
                upDiff = Math.max(upDiff, 0 - (weapon2.position.y - weapon2.height / 2));
                bottomDiff = Math.max(bottomDiff, (weapon2.position.y + weapon2.height / 2) - statue.height);
            }

            if (leftDiff > 0 && container.width > leftDiff + statue.width) {
                leftDiff = container.width - statue.width;
                if (weapon2) {
                    leftDiff -= rightDiff;
                }
            }
            if (upDiff > 0 && container.height > upDiff + statue.height) {
                upDiff = container.height - statue.height;
                if (weapon2) {
                    upDiff -= bottomDiff;
                }
            }
            this.anchor.x = (statue.width / 2 + leftDiff) / container.width;
            this.anchor.y = (statue.height / 2 + upDiff) / container.height;
        } else {
            this.anchor.set(0.5, 0.5);
        }
        const newTexture = Game.app.renderer.generateTexture(container);
        if (this.customTexture) this.texture.destroy();
        this.texture = newTexture;
        this.generateEmptyTrim();
        this.fitToTile();
        this.place();
        if (this.weapon) this.showItem(this.weapon);
        else this.hideItem();
        this.customTexture = true;
        this.destroyItemSprite();
    }

    interact(player) {
        if (!this.marauded) this.maraud();
        if (this.weapon === null) this.weapon = removeEquipmentFromPlayer(player, EQUIPMENT_TYPE.WEAPON);
        else this.weapon = swapEquipmentWithPlayer(player, this.weapon);
        this.updateTexture();
    }

    maraud() {
        this.marauded = true;
        //createFadingText("Marauder!", this.position.x, this.position.y);
        //longShakeScreen();
        Game.maraudedStatues.push(this.weapon);
    }

    destroyItemSprite() {
        Game.world.removeChild(this.itemSprite);
        if (this.animation) Game.app.ticker.remove(this.animation);
    }
}