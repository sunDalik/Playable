import {Game} from "../../../game"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";

export class Scythe {
    constructor() {
        this.texture = Game.resources["src/images/weapons/scythe.png"].texture;
        this.type = WEAPON_TYPE.SCYTHE;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
    }

    attack(wielder, tileDirX, tileDirY) {
        return false;
    }
}