import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {Weapon} from "../weapon";
import {Minion} from "../minion";
import {randomChoice} from "../../../utils/random_utils";
import {getCardinalDirections} from "../../../utils/map_utils";

export class DogStaff extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["dog_staff.png"];
        this.id = EQUIPMENT_ID.DOG_STAFF;
        this.name = "Dog Staff";
        this.description = "";
        this.rarity = RARITY.C;
        this.minions = [new DogStaffMinion()];
    }

    attack(wielder, tileDirX, tileDirY) {
        return false;
    }

    onWear(wielder) {
        super.onWear(wielder);
        for (const minion of this.minions) {
            minion.activate(wielder);
        }
    }

    onTakeOff(wielder) {
        super.onTakeOff(wielder);
        for (const minion of this.minions) {
            minion.deactivate();
        }
    }

    onMove(wielder, tileStepX, tileStepY) {
        super.onMove(wielder, tileStepX, tileStepY);
        for (const minion of this.minions) {
            minion.move();
        }
    }

    onRevive(wielder) {
        super.onRevive(wielder);
        for (const minion of this.minions) {
            minion.activate(wielder);
        }
    }

    onDeath(wielder) {
        super.onDeath(wielder);
        for (const minion of this.minions) {
            minion.deactivate();
        }
    }

}

class DogStaffMinion extends Minion {
    constructor(texture = WeaponsSpriteSheet["dog_staff_minion.png"]) {
        super(texture);
        this.stepping = true;
        this.tallModifier -= 3;
    }

    getOffset() {
        return randomChoice(getCardinalDirections());
    }

    correctScale(stepDirection) {
        if (stepDirection.x !== 0) {
            this.scale.x = Math.abs(this.scale.x) * stepDirection.x * -1;
        }
    }
}