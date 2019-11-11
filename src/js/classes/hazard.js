import {Game} from "../game"
import {FullTileElement} from "./full_tile_element";
import {removeObjectFromArray} from "../utils";

export class Hazard extends FullTileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.zIndex = -3;
        this.LIFETIME = 0;
        this.turnsLeft = this.LIFETIME;
        this.atk = 0;
    }

    addToWorld() {
        Game.world.addChild(this);
        Game.hazards.push(this);
        Game.map[this.tilePosition.y][this.tilePosition.x].hazard = this;
    }

    removeFromWorld() {
        Game.world.removeChild(this);
        removeObjectFromArray(this, Game.hazards);
        Game.map[this.tilePosition.y][this.tilePosition.x].hazard = null;
    }

    //returns true if hazard still lives
    updateLifetime() {
        if (this.turnsLeft === 0) {
            this.removeFromWorld();
            this.turnsLeft = -99;
            return false;
        } else {
            this.turnsLeft--;
            return true;
        }
    }

    refreshLifetime() {
        this.turnsLeft = this.LIFETIME;
    }
}