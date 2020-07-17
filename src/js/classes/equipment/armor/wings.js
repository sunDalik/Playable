import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";
import {Equipment} from "../equipment";

export class Wings extends Equipment {
    constructor() {
        super();
        this.texture = ArmorSpriteSheet["wings.png"];
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.id = EQUIPMENT_ID.WINGS;
        this.passiveDef = 0;
        this.name = "Wings";
        this.description = "Immunity to hazards\n50% to dodge any attack\nIf you fail to dodge 2 times in a row, the 3rd dodge is guaranteed to succeed";
        this.rarity = RARITY.S;
        this.poisonImmunity = true;
        this.fireImmunity = true;
        this.failedDodges = 0;
    }

    dodge() {
        if (Math.random() < 0.5) {
            //success
            this.failedDodges = 0;
            return true;
        } else {
            //fail
            this.failedDodges++;
            if (this.failedDodges >= 3) {
                this.failedDodges = 0;
                return true;
            } else return false;
        }
    }
}