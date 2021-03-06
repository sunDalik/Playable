import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {PiercingBowLikeWeapon} from "./piercing_bow_like_weapon";

export class EmpyrealBow extends PiercingBowLikeWeapon {
    constructor() {
        super(WeaponsSpriteSheet["divine_bow.png"]);
        this.arrowTexture = WeaponsSpriteSheet["divine_arrow.png"];
        this.id = EQUIPMENT_ID.EMPYREAL_BOW;
        this.atk = 1.5;
        this.range = 4;
        this.name = "Empyreal Bow";
        this.description = "Range 4\nPiercing\nAttack = 1.5 at full range | 1.25 at range 3 | 1 at range 2 | 0.75 at range 1";
        this.rarity = RARITY.S;
    }

    getAtk(wielder, range) {
        //0.75 1 1.25 1.5
        return wielder.getAtk(this, 0.5 + range * 0.25 + (this.atk - 1.5));

        // 0.5 1 1.5 2
        //return wielder.getAtk(this, 0.5 + (range - 1) * 0.5);
    }

    getArrowAnimationTime(atkOffsetX, atkOffsetY) {
        return 1.5 * (Math.abs(atkOffsetX) + Math.abs(atkOffsetY));
    }
}