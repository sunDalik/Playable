import {Equipment} from "./equipment";
import {EQUIPMENT_TYPE} from "../../enums";

export class Weapon extends Equipment {
    constructor() {
        super();
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
    }

    attack(wielder, tileDirX, tileDirY) {}
}