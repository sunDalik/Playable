import {Weapon} from "../weapon";

export class MinionStaff extends Weapon {
    constructor() {
        super();
        this.isMinionStaff = true;
    }

    attack(wielder, tileDirX, tileDirY) {
        return false;
    }
}