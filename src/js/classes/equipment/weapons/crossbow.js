import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {BowLikeWeapon} from "./bow_like_weapon";

export class Crossbow extends BowLikeWeapon {
    constructor() {
        super(WeaponsSpriteSheet["crossbow.png"]);
        this.arrowTexture = WeaponsSpriteSheet["crossbow_bolt.png"];
        this.id = EQUIPMENT_ID.CROSSBOW;
        this.atk = 1;
        this.name = "Crossbow";
        this.description = "Range 3\nAttack 1";
        this.rarity = RARITY.A;
    }

    getAtk(wielder, range) {
        return wielder.getAtk(this);
    }

    getArrowAnimationTime(atkOffsetX, atkOffsetY) {
        return 2 * (Math.abs(atkOffsetX) + Math.abs(atkOffsetY));
    }
}