import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {BowLikeWeapon} from "./bow_like_weapon";

export class CerberusBow extends BowLikeWeapon {
    constructor() {
        super(WeaponsSpriteSheet["cerberus_bow.png"]);
        this.id = EQUIPMENT_ID.CERBERUS_BOW;
        this.arrowTexture = WeaponsSpriteSheet["hell_arrow.png"];
        this.atk = 1;
        this.name = "Cerberus Bow";
        this.description = "Range 3\nAttack = 1 at full range | 0.75 at range 2 | 0.25 at range 1\nThis bow can fire up to 2 additional diagonal arrows";
        this.rarity = RARITY.A;
    }

    // todo should damage all enemies in one go
    attack(wielder, dirX, dirY) {
        if (super.attack(wielder, dirX, dirY)) {
            this.shootDiagonally(wielder, dirX, dirY, -1);
            this.shootDiagonally(wielder, dirX, dirY, 1);
            return true;
        } else {
            return false;
        }
    }

    getAtk(wielder, range) {
        let baseAtk;
        if (range === 1) baseAtk = 0.25;
        else if (range === 2) baseAtk = 0.75;
        else baseAtk = 1;
        return wielder.getAtk(this, baseAtk + (this.atk - 1));
    }

    getArrowAnimationTime(atkOffsetX, atkOffsetY) {
        return 1.5 * (Math.abs(atkOffsetX) + Math.abs(atkOffsetY));
    }
}