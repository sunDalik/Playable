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
        this.range = 4;
        this.name = "Divine Bow";
        this.description = "Range 4\nPiercing\nAttack = 2 at full range | 1.5 at range 3 | 1 at range 2 | 0.5 at range 1";
        this.rarity = RARITY.S;
    }

    getAtk(wielder, range) {
        return wielder.getAtk(this, 0.5 + (range - 1) * 0.5);
    }

    getArrowAnimationTime(atkOffsetX, atkOffsetY) {
        return 1.5 * (Math.abs(atkOffsetX) + Math.abs(atkOffsetY));
    }
}