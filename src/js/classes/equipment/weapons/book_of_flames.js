import {Game} from "../../../game"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";

export class BookOfFlames {
    constructor() {
        this.texture = Game.resources["src/images/weapons/book_of_flames.png"].texture;
        this.type = WEAPON_TYPE.BOOK_OF_FLAMES;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 2;
    }

    attack(wielder, tileDirX, tileDirY) {
        return false;
    }
}