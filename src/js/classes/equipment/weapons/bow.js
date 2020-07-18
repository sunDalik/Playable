import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {BowLikeWeapon} from "./bow_like_weapon";

export class Bow extends BowLikeWeapon {
    constructor() {
        super(WeaponsSpriteSheet["bow.png"]);
        this.id = EQUIPMENT_ID.BOW;
        this.atk = 1;
        this.name = "Bow";
        this.description = "Range 3\nAttack = 1 at full range | 0.75 at range 2 | 0.25 at range 1";
        this.rarity = RARITY.B;
    }

    getAtk(wielder, range) {
        let baseAtk;
        if (range === 1) baseAtk = 0.25;
        else if (range === 2) baseAtk = 0.75;
        else baseAtk = 1;
        return wielder.getAtk(this, baseAtk + (this.atk - 1));
    }
}