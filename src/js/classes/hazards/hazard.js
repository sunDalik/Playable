import {Game} from "../../game"
import {removeObjectFromArray} from "../../utils/basic_utils";
import {TileElement} from "../tile_elements/tile_element";
import {Z_INDEXES} from "../../z_indexing";

export class Hazard extends TileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.LIFETIME = 0;
        this.name = "Hazard";
        this.turnsLeft = this.LIFETIME;
        this.atk = 0;
        this.setCenterPreservation()
    }

    correctZIndex() {
        this.zIndex = Z_INDEXES.HAZARD;
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
        if (this.turnsLeft > 0) {
            this.turnsLeft--;
            return true;
        } else {
            this.removeFromWorld();
            this.turnsLeft = -99;
            return false;
        }
    }

    //returns true if hazard was spoiled
    spoil(competingHazard) {
        this.turnsLeft -= Math.floor(this.LIFETIME / 4);
        if (this.turnsLeft <= 0) {
            this.removeFromWorld();
            competingHazard.addToWorld();
            return true;
        }
        return false;
    }

    refreshLifetime() {
        this.turnsLeft = this.LIFETIME;
    }
}