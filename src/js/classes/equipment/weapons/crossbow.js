import {RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {BowLikeWeapon} from "./bow_like_weapon";

export class Crossbow extends BowLikeWeapon {
    constructor() {
        super(WeaponsSpriteSheet["crossbow.png"]);
        this.arrowTexture = WeaponsSpriteSheet["crossbow_bolt.png"];
        this.type = WEAPON_TYPE.CROSSBOW;
        this.atk = 0.75;
        this.name = "Crossbow";
        this.description = "Range 3\nAttack 0.75";
        this.rarity = RARITY.A;
    }

    getAtk(wielder, range) {
        return wielder.getAtk(this);
    }
}