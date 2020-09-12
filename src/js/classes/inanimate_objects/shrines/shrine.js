import {TileElement} from "../../tile_elements/tile_element";
import {InanimatesSpriteSheet} from "../../../loader";
import {INANIMATE_TYPE, ROLE} from "../../../enums/enums";

export class Shrine extends TileElement {
    constructor(tilePositionX, tilePositionY, texture = InanimatesSpriteSheet["obelisk.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.SHRINE;
    }

    interact(player) {
    }

    onUpdate() {
    }
}