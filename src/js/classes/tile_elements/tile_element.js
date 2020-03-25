import {Sprite} from "pixi.js"
import {Game} from "../../game"
import {getZIndexForLayer} from "../../z_indexing";
import * as PIXI from "pixi.js";

export class TileElement extends Sprite {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture);
        this.tilePosition = {
            x: tilePositionX,
            y: tilePositionY,
            set(x, y) {
                this.x = x;
                this.y = y;
            }
        };
        this.animation = null;
        this.anchor.set(0.5, 0.5);
        this.scaleModifier = 1;
        this.fitToTile();
        if (!this.texture.trim) this.texture.trim = new PIXI.Rectangle(0, 0, this.texture.frame.width, this.texture.frame.height);
        this.place();
        this.filters = [];
        this.ownZIndex = 0;
        this.correctZIndex();
    }

    setScaleModifier(scaleModifier) {
        this.scaleModifier = scaleModifier;
        this.fitToTile();
    }

    correctZIndex() {
        this.zIndex = getZIndexForLayer(this.tilePosition.y) + this.ownZIndex;
    }

    cancelAnimation() {
        Game.app.ticker.remove(this.animation);
        this.animation = null;
        this.place();
    }

    //needs to be revised...
    fitToTile() {
        const scaleX = Game.TILESIZE / this.getUnscaledWidth() * this.scaleModifier;
        const scaleY = Math.abs(scaleX);
        this.scale.set(scaleX, scaleY);
    }

    place() {
        this.position.x = this.getTilePositionX();
        this.position.y = this.getTilePositionY();
    }

    getTilePositionX() {
        return Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
    }

    getTilePositionY() {
        return Game.TILESIZE * this.tilePosition.y + (Game.TILESIZE - this.height) / 2 + this.height * this.anchor.y;
    }

    getUnscaledWidth() {
        return this.width / this.scale.x;
    }

    getUnscaledHeight() {
        return this.height / this.scale.y;
    }
}