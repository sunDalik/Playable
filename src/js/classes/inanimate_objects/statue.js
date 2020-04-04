import {Game} from "../../game"
import {EQUIPMENT_TYPE, INANIMATE_TYPE, ROLE} from "../../enums";
import {createFadingText} from "../../animations";
import {getInanimateItemLabelTextStyle} from "../../drawing/draw_constants";
import * as PIXI from "pixi.js";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";
import {removeEquipmentFromPlayer, swapEquipmentWithPlayer} from "../../game_logic";
import {InanimatesSpriteSheet} from "../../loader";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import {TileElement} from "../tile_elements/tile_element";

export const statueLeftHandPoint = {x: 195, y: 200};
export const statueRightHandPoint = {x: 65, y: 108};

export class Statue extends TileElement {
    constructor(tilePositionX, tilePositionY, weapon) {
        super(InanimatesSpriteSheet["statue.png"], tilePositionX, tilePositionY);
        this.weapon = weapon;
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.STATUE;
        this.marauded = false;
        this.customTexture = false;
        this.textObj = new PIXI.Text("", getInanimateItemLabelTextStyle());
        this.textObj.anchor.set(0.5, 0.5);
        this.textObj.position.set(this.position.x, this.position.y - this.texture.frame.height * this.scale.y * 1.4);
        this.textObj.visible = false;
        this.textObj.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.META;
        Game.world.addChild(this.textObj);
        this.updateTexture();
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
        if (this.weapon) {
            this.textObj.text = this.weapon.name;
            this.textObj.style.fill = this.weapon.rarity.color;
        } else {
            this.textObj.text = "";
        }

        const container = new PIXI.Container();
        container.sortableChildren = true;
        const statue = new PIXI.Sprite(InanimatesSpriteSheet["statue.png"]);
        container.addChild(statue);
        const hands = new PIXI.Sprite(InanimatesSpriteSheet["statue_hands.png"]);
        hands.zIndex = statue.zIndex + 2;
        container.addChild(hands);
        if (this.weapon) {
            const weapon = new PIXI.Sprite(this.weapon.texture);
            weapon.anchor.set(0.5, 0.5);
            if (this.weapon.getStatuePlacement) {
                const placement = this.weapon.getStatuePlacement();
                weapon.scale.x = weapon.scale.y = statue.width / weapon.width * placement.scaleModifier;
                if (placement.mirrorX) weapon.scale.x *= -1;
                weapon.position.set(placement.x, placement.y);
                weapon.angle = placement.angle;
            } else {
                weapon.scale.x = weapon.scale.y = statue.width / weapon.width * 0.7;
            }
            weapon.zIndex = hands.zIndex - 1;
            container.addChild(weapon);

            //recalculating anchor.x
            const leftStatueBound = Math.min(hands.position.x, statue.position.x);
            const rightStatueBound = Math.max(hands.position.x + hands.width, statue.position.x + statue.width);
            const leftWeaponBound = weapon.position.x - weapon.width / 2;
            const rightWeaponBound = weapon.position.x + weapon.width / 2;
            const leftDiff = Math.max(0, leftStatueBound - leftWeaponBound);
            const rightDiff = Math.max(0, rightWeaponBound - rightStatueBound);
            const originalWidth = InanimatesSpriteSheet["statue.png"].width;
            this.anchor.x = 0.5 + leftDiff / container.width / 2 - rightDiff / container.width / 2;
        } else {
            this.anchor.x = 0.5;
        }
        const newTexture = Game.app.renderer.generateTexture(container);
        if (this.customTexture) this.texture.destroy();
        this.texture = newTexture;
        this.generateEmptyTrim();
        this.fitToTile();
        this.customTexture = true;
    }

    interact(player) {
        if (!this.marauded) this.maraud();
        if (this.weapon === null) this.weapon = removeEquipmentFromPlayer(player, EQUIPMENT_TYPE.WEAPON);
        else this.weapon = swapEquipmentWithPlayer(player, this.weapon);
        this.updateTexture();
    }

    maraud() {
        this.marauded = true;
        createFadingText("Marauder!", this.position.x, this.position.y);
        //longShakeScreen();
        Game.maraudedStatues.push(this.weapon);
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