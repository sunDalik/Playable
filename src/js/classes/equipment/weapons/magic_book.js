import {redrawSlotContents} from "../../../drawing/draw_hud";
import {DESATURATE_FILTER} from "../../../filters";
import * as PIXI from "pixi.js";
import {Game} from "../../../game";
import {createFadingText} from "../../../animations";
import {randomChoice} from "../../../utils/random_utils";
import {TileElement} from "../../tile_elements/tile_element";
import {statueLeftHandPoint} from "../../inanimate_objects/statue";
import {Weapon} from "../weapon";

export class MagicBook extends Weapon {
    constructor(texture) {
        super();
        this.texture = this.defaultTexture = texture;
        this.magical = true;
        this.currentFocus = 0;
        this.focusedThisTurn = false;

        //you should override these values
        this.uses = this.maxUses = 1;
        this.focusTime = 1;
        this.primaryColor = 0x000000;
        this.holdTime = 20;
    }

    updateTexture(wielder) {
        if (this.texture !== this.defaultTexture) this.texture.destroy();
        if (this.uses === this.maxUses) {
            this.texture = this.defaultTexture;
        } else {
            const container = new PIXI.Container();
            container.sortableChildren = true;
            const book = new PIXI.Sprite(this.defaultTexture);
            book.zIndex = 1;
            if (this.uses === 0) book.filters = [DESATURATE_FILTER];
            container.addChild(book);
            for (let f = 1; f <= this.focusTime - this.currentFocus; f++) {
                const circle = new PIXI.Graphics();
                const minRadius = book.width / 4;
                const maxRadius = book.width / 2 - 10;
                const radius = minRadius + (maxRadius - minRadius) / this.focusTime * f;
                circle.lineStyle(11, this.primaryColor);
                circle.drawCircle(0, 0, radius);
                circle.position.set(book.width / 2, book.height / 2);
                container.addChild(circle);
            }
            this.texture = Game.app.renderer.generateTexture(container);
        }
        redrawSlotContents(wielder, wielder.getSlotNameOfItem(this));
    }

    focus(wielder, createText = true) {
        if (this.uses < this.maxUses) {
            this.currentFocus++;
            this.holdBookAnimation(wielder, 1, 0);
            this.focusedThisTurn = true;
            const fontSize = Game.TILESIZE / 65 * 22;
            if (this.currentFocus >= this.focusTime) {
                this.currentFocus = 0;
                this.uses = this.maxUses;
                this.updateTexture(wielder);
                if (createText) createFadingText("Clear mind!", wielder.position.x, wielder.position.y, fontSize, 30);
            } else {
                this.updateTexture(wielder);
                if (createText) createFadingText("Focus", wielder.position.x, wielder.position.y, fontSize * ((this.currentFocus + 1) / this.focusTime), 30);
            }
            return true;
        } else return false;
    }

    onNewTurn(wielder) {
        if (!this.focusedThisTurn && this.uses < this.maxUses && this.currentFocus > 0) {
            this.currentFocus = 0;
            this.updateTexture(wielder);
        }
        this.focusedThisTurn = false;
    }

    holdBookAnimation(wielder, dirX, dirY) {
        const offsetMod = 0.3;
        const offsetX = dirX !== 0 ? dirX * offsetMod : randomChoice([offsetMod, -offsetMod]);
        const bookSprite = new TileElement(this.defaultTexture, wielder.tilePosition.x, wielder.tilePosition.y);
        bookSprite.position.set(wielder.getTilePositionX() + offsetX * Game.TILESIZE, wielder.getTilePositionY());
        Game.world.addChild(bookSprite);
        wielder.animationSubSprites.push(bookSprite);
        bookSprite.zIndex = Game.primaryPlayer.zIndex + 1;
        bookSprite.scaleModifier = 0.85;
        bookSprite.fitToTile();
        if (Math.sign(offsetX) === -1) bookSprite.scale.x *= -1;

        let counter = 0;
        const animation = delta => {
            counter += delta;
            if (counter >= this.holdTime) {
                Game.world.removeChild(bookSprite);
                Game.app.ticker.remove(animation);
            }
        };

        wielder.animation = animation;
        Game.app.ticker.add(animation);
    }

    getStatuePlacement() {
        return {
            x: statueLeftHandPoint.x + 15,
            y: statueLeftHandPoint.y + 20,
            angle: 20,
            scaleModifier: 0.60,
            texture: this.defaultTexture
        };
    }
}