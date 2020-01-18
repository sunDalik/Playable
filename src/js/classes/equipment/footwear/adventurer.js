import {Game} from "../../../game"
import {EQUIPMENT_TYPE, FOOTWEAR_TYPE, RARITY} from "../../../enums";

export class AdventurerBoots {
    constructor() {
        this.texture = Game.resources["src/images/footwear/adventurer.png"].texture;
        this.type = FOOTWEAR_TYPE.ADVENTURER;
        this.equipmentType = EQUIPMENT_TYPE.FOOT;
        this.name = "Adventurer Boots";
        this.description = "Immunity to poison";
        this.rarity = RARITY.C;
    }

    onWear(wielder) {
        wielder.poisonImmunity++;
    }

    onTakeOff(wielder) {
        wielder.poisonImmunity--;
    }
}