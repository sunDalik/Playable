import {RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueRightHandPoint} from "../../inanimate_objects/statue";
import {BowLikeWeapon} from "./bow_like_weapon";

export class Bow extends BowLikeWeapon {
    constructor() {
        super(WeaponsSpriteSheet["bow.png"]);
        this.type = WEAPON_TYPE.BOW;
        this.atk = 0.75;
        this.name = "Bow";
        this.description = "Range 3\nAttack = 0.25 * distance to target\n";
        this.rarity = RARITY.B;
    }

    getAtk(wielder, range) {
        return wielder.getAtkWithWeapon(this, this.atk * (range / 3));
    }

    getStatuePlacement() {
        return {
            x: statueRightHandPoint.x + 50,
            y: statueRightHandPoint.y + 45,
            angle: -10,
            scaleModifier: 0.9,
            zIndex: 3
        };
    }
}