import {RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueRightHandPoint} from "../../inanimate_objects/statue";
import {PiercingBowLikeWeapon} from "./piercing_bow_like_weapon";

export class DivineBow extends PiercingBowLikeWeapon {
    constructor() {
        super(WeaponsSpriteSheet["divine_bow.png"]);
        this.arrowTexture = WeaponsSpriteSheet["divine_arrow.png"];
        this.type = WEAPON_TYPE.DIVINE_BOW;
        //atk 1 or range 4? hmmmmm
        this.atk = 1;
        this.name = "Divine Bow";
        this.description = "Range 3\nAttack 1\nPiercing";
        this.rarity = RARITY.S;
    }

    getAtk(wielder, range) {
        return wielder.getAtkWithWeapon(this);
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