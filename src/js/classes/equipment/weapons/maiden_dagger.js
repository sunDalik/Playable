import {Game} from "../../../game"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";

export class MaidenDagger {
    constructor() {
        this.texture = Game.resources["src/images/weapons/maiden_dagger.png"].texture;
        this.type = WEAPON_TYPE.MAIDEN_DAGGER;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
    }

    attack(wielder, tileDirX, tileDirY) {
        return false;
    }
}