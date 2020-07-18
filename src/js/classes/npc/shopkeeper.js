import {TileElement} from "../tile_elements/tile_element";
import {Game} from "../../game";
import {INANIMATE_TYPE, ROLE} from "../../enums/enums";


export class Shopkeeper extends TileElement {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/npc/shopkeeper.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.SHOPKEEPER;
        this.setScaleModifier(1.2);
    }

    interact() {}


    onUpdate() {
        this.filters = [];
    }
}