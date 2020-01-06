import {Game} from "../../game"
import {TallTileElement} from "../tile_elements/tall_tile_element"
import {INANIMATE_TYPE, ROLE} from "../../enums";

export class FireGoblet extends TallTileElement {
    constructor(tilePositionX, tilePositionY) {
        super(Game.resources["src/images/other/fire_goblet.png"].texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.FIRE_GOBLET;
        this.zIndex = Game.primaryPlayer.zIndex + 1;
    }

    push() {

    }
}