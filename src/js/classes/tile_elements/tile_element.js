import {Sprite} from "pixi.js"
import {Game} from "../../game"
import {getZIndexForLayer} from "../../z_indexing";
import * as PIXI from "pixi.js";

export const floorLevel = Game.TILESIZE * 0.5;

export class TileElement extends Sprite {
    constructor(texture, tilePositionX, tilePositionY, keepInside = false) {
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
        this.generateEmptyTrim();
        this.preserveCenteredPosition = keepInside;
        this.tallModifier = 0;
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

    setOwnZIndex(ownZIndex) {
        this.ownZIndex = ownZIndex;
        this.correctZIndex();
    }

    setCenterPreservation() {
        this.preserveCenteredPosition = true;
        this.place();
    }

    removeCenterPreservation() {
        this.preserveCenteredPosition = false;
        this.place();
    }

    place() {
        this.position.x = this.getTilePositionX();
        this.position.y = this.getTilePositionY();
    }

    getTilePositionX() {
        return Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * 0.5;
    }

    getTilePositionY() {
        const basePosY = Game.TILESIZE * this.tilePosition.y + (Game.TILESIZE - this.height) / 2 + this.height * this.anchor.y;
        if (this.preserveCenteredPosition)
            return basePosY;
        else
            return basePosY + (this.texture.height - this.texture.trim.bottom) * Math.abs(this.scale.y) + (Game.TILESIZE - this.height) / 2
                - floorLevel - this.tallModifier;
    }

    getUnscaledWidth() {
        return this.width / this.scale.x;
    }

    getUnscaledHeight() {
        return this.height / this.scale.y;
    }

    generateEmptyTrim() {
        if (!this.texture.trim) this.texture.trim = new PIXI.Rectangle(0, 0, this.texture.frame.width, this.texture.frame.height);
    }
}