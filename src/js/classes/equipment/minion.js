import {AnimatedTileElement} from "../tile_elements/animated_tile_element";
import {Game} from "../../game";
import {Z_INDEXES} from "../../z_indexing";

export class Minion extends AnimatedTileElement {
    constructor(texture) {
        super(texture, 1, 1);
        this.wielder = null;
        this.offset = {x: 1, y: 1};
        this.stepping = true;
        this.setOwnZIndex(Z_INDEXES.ENEMY + 1);
    }

    move() {
        if (!this.wielder) return;
        const stepDirection = this.getStepDirection();
        this.correctScale(stepDirection);
        if (this.stepping) {
            this.step(stepDirection.x, stepDirection.y, () => this.placeShadow());
        } else {
            this.slide(stepDirection.x, stepDirection.y, () => this.placeShadow());
        }
    }

    correctScale(stepDirection) {
        if (stepDirection.x !== 0) {
            this.scale.x = Math.abs(this.scale.x) * stepDirection.x;
        }
    }

    getStepDirection() {
        return {
            x: this.wielder.tilePosition.x - this.tilePosition.x + this.offset.x,
            y: this.wielder.tilePosition.y - this.tilePosition.y + this.offset.y
        };
    }

    activate(wielder) {
        this.wielder = wielder;
        this.offset = this.getOffset();
        Game.world.addChild(this);
        this.setTilePosition(this.wielder.tilePosition.x + this.offset.x, this.wielder.tilePosition.y + this.offset.y);
    }

    removeFromMap() {}

    placeOnMap() {}


    getOffset() {
        return {x: 1, y: 1};
    }

    deactivate() {
        Game.world.removeChild(this);
        this.wielder = null;
    }
}