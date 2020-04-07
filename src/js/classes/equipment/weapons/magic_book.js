import {WeaponsSpriteSheet} from "../../../loader";
import {redrawSlotContents} from "../../../drawing/draw_hud";
import {DESATURATE_FILTER, ITEM_OUTLINE_FILTER} from "../../../filters";
import * as PIXI from "pixi.js";
import {Game} from "../../../game";

export class MagicBook {
    constructor(texture) {
        this.texture = this.defaultTexture = texture;
        this.magical = true;
        this.currentFocus = 0;
        this.focusedThisTurn = false;

        //you should override these values
        this.maxUses = 1;
        this.uses = this.maxUses;
        this.focusNeeded = 1;
        this.primaryColor = 0x000000;
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
            for (let f = 1; f <= this.focusNeeded - this.currentFocus; f++) {
                const circle = new PIXI.Graphics();
                const minRadius = book.width / 4;
                const maxRadius = book.width / 2 - 10;
                const radius = minRadius + (maxRadius - minRadius) / this.focusNeeded * f;
                circle.lineStyle(11, this.primaryColor);
                circle.drawCircle(0, 0, radius);
                circle.position.set(book.width / 2, book.height / 2);
                container.addChild(circle)
            }
            this.texture = Game.app.renderer.generateTexture(container);
        }
        redrawSlotContents(wielder, wielder.getPropertyNameOfItem(this));
    }
}