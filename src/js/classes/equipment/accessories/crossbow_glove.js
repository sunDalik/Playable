import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {AccessoriesSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";
import {Crossbow} from "../weapons/crossbow";
import {getCardinalDirections} from "../../../utils/map_utils";
import {randomShuffle} from "../../../utils/random_utils";

export class CrossbowGlove extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["crossbow_glove.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.CROSSBOW_GLOVE;
        this.name = "Crossbow Glove";
        this.description = "Whenever you attack with a weapon, shoot a crossbow bolt with range 3 and damage 1 in a random cardinal direction that doesn't match your attack direction";
        this.rarity = RARITY.A;
        this.shooter = new CrossbowGloveShooter();
    }

    afterAttack(wielder, dirX, dirY) {
        const directions = randomShuffle(getCardinalDirections().filter(d => d.x !== dirX || d.y !== dirY));
        for (const dir of directions) {
            if (this.shooter.attack(wielder, dir.x, dir.y)) break;
        }
    }
}

class CrossbowGloveShooter extends Crossbow {
    constructor() {
        super();
    }

    createBowAnimation(wielder, atkOffsetX, atkOffsetY) {
        this.createArrowAnimation(wielder, atkOffsetX, atkOffsetY);
    }

    getAtk(wielder, range) {
        return 1;
    }
}