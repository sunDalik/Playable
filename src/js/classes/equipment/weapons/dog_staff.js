import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {Minion} from "../minion";
import {MinionStaff} from "./minion_staff";

export class DogStaff extends MinionStaff {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["dog_staff.png"];
        this.id = EQUIPMENT_ID.DOG_STAFF;
        this.name = "Dog Staff";
        this.createDescription("Dog minion deals 0.5 damage to enemies it touches", "Dog");
        this.rarity = RARITY.C;
        this.minions = [new DogStaffMinion()];
    }
}

class DogStaffMinion extends Minion {
    constructor(texture = WeaponsSpriteSheet["dog_staff_minion.png"]) {
        super(texture);
        this.stepping = true;
        this.tallModifier -= 3;
    }

    correctScale(stepDirection) {
        if (stepDirection.x !== 0) {
            this.scale.x = Math.abs(this.scale.x) * Math.sign(stepDirection.x) * -1;
        }
    }
}