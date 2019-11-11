import {Sprite} from "pixi.js"
import {Game} from "../game"

export class TileElement extends Sprite {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
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
        this.scaleModifier = 0.8;
        this.anchor.set(0.5, 0.5);
        this.fitToTile();
        this.place();
    }

    cancelAnimation() {
        Game.APP.ticker.remove(this.animation);
        this.place();
    }

    fitToTile() {
        const scaleX = Game.TILESIZE / this.getUnscaledWidth() * this.scaleModifier;
        const scaleY = Math.abs(scaleX);
        this.scale.set(scaleX, scaleY);
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = Game.TILESIZE * this.tilePosition.y + (Game.TILESIZE - this.height) / 2 + this.height * this.anchor.y;
    }

    getUnscaledWidth() {
        return this.width / this.scale.x;
    }

    getUnscaledHeight() {
        return this.height / this.scale.y;
    }

    setAnchorToCenter() {
        this.anchor.set(0.5, 0.5);
        this.position.x += this.width * 0.5;
        this.position.y += this.height * 0.5;
    }

    resetAnchor() {
        const previousAnchorX = this.anchor.x;
        const previousAnchorY = this.anchor.y;
        this.anchor.set(0, 0);
        this.position.x -= this.width * previousAnchorX;
        this.position.y -= this.height * previousAnchorY;
    }
}