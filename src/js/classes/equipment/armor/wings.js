import {Game} from "../../../game"
import {EQUIPMENT_TYPE, ARMOR_TYPE, RARITY} from "../../../enums";
import {ArmorSpriteSheet} from "../../../loader";

export class Wings {
    constructor() {
        this.texture = ArmorSpriteSheet["wings.png"];
        this.type = ARMOR_TYPE.WINGS;
        this.equipmentType = EQUIPMENT_TYPE.ARMOR;
        this.def = 0;
        this.dodgeChance = 0.5;
        this.name = "Wings";
        this.description = "50% to dodge any attack\nImmunity to hazards";
        this.rarity = RARITY.S;
    }

    onWear(wielder) {
        wielder.poisonImmunity++;
        wielder.fireImmunity++;
    }

    onTakeOff(wielder) {
        wielder.poisonImmunity--;
        wielder.fireImmunity--;
    }
}