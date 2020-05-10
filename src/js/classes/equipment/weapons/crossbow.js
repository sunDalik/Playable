import {RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueLeftHandPoint} from "../../inanimate_objects/statue";
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
        return wielder.getAtkWithWeapon(this);
    }

    getStatuePlacement() {
        return {
            x: statueLeftHandPoint.x + 40,
            y: statueLeftHandPoint.y + 35,
            angle: 170,
            scaleModifier: 0.9,
            zIndex: 3
        };
    }
}