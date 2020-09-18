import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY, SLOT} from "../../../enums/enums";
import {AccessoriesSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";
import {randomShuffle} from "../../../utils/random_utils";
import {Game} from "../../../game";

// todo problems
//  doesnt pierce and go range 4 if used with divine bow
export class QuiverOfTheForestSpirit extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["quiver_of_the_forest_spirit.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.QUIVER_OF_THE_FOREST_SPIRIT;
        this.passiveAtk = 0.25;
        this.name = "Quiver of the Forest Spirit";
        this.description = "+0.25 attack\nWhenever you shoot with a bow, shoot an extra diagonal arrow";
        this.rarity = RARITY.B;
    }


    afterAttack(wielder, dirX, dirY) {
        super.afterAttack(wielder, dirX, dirY);
        const weapon = Game.afterTurn ? wielder[SLOT.EXTRA] : wielder[SLOT.WEAPON];
        if (weapon && weapon.bowLike && weapon.shootDiagonally) {
            for (const sign of randomShuffle([-1, 1])) {
                if (weapon.shootDiagonally(wielder, dirX, dirY, sign)) break;
            }
        }
    }
}