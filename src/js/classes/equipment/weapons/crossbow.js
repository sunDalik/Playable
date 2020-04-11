import {RARITY, WEAPON_TYPE} from "../../../enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {statueRightHandPoint} from "../../inanimate_objects/statue";
import {BowLikeWeapon} from "./bow_like_weapon";

export class Crossbow extends BowLikeWeapon {
    constructor() {
        super(WeaponsSpriteSheet["crossbow.png"]);
        this.arrowTexture = WeaponsSpriteSheet["crossbow_bolt.png"];
        this.type = WEAPON_TYPE.CROSSBOW;
        this.atk = 0.75;
        this.name = "Crossbow";
        this.description = "Ranged weapon with no penalties";
        this.rarity = RARITY.A;
    }

    getAtk(wielder, range) {
        return wielder.getAtkWithWeapon(this);
    }


    //todo
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