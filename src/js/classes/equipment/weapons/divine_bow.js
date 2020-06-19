import {EQUIPMENT_ID, RARITY} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {PiercingBowLikeWeapon} from "./piercing_bow_like_weapon";

export class DivineBow extends PiercingBowLikeWeapon {
    constructor() {
        super(WeaponsSpriteSheet["divine_bow.png"]);
        this.arrowTexture = WeaponsSpriteSheet["divine_arrow.png"];
        this.id = EQUIPMENT_ID.DIVINE_BOW;
        //atk 1 or range 4? hmmmmm
        this.atk = 1;
        this.name = "Divine Bow";
        this.description = "Range 3\nAttack 1\nPiercing";
        this.rarity = RARITY.S;
    }

    getAtk(wielder, range) {
        return wielder.getAtk(this);
    }

    getArrowAnimationTime(atkOffsetX, atkOffsetY) {
        return 1.5 * (Math.abs(atkOffsetX) + Math.abs(atkOffsetY));
    }
}