import {Weapon} from "../weapon";

export class MinionStaff extends Weapon {
    constructor() {
        super();
        this.isMinionStaff = true;
    }

    attack(wielder, tileDirX, tileDirY) {
        return false;
    }

    createDescription(firstLine, minionName) {
        this.description = firstLine + "\n" + minionName + " ATK is increased by 0.5 if put in WEAPON slot\nMinion ATK does not depend on normal ATK stats";
    }
}