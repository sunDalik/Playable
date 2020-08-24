import {EQUIPMENT_ID, EQUIPMENT_TYPE, RARITY} from "../../../enums/enums";
import {AccessoriesSpriteSheet} from "../../../loader";
import {Minion} from "../minion";
import {Equipment} from "../equipment";
import {Game} from "../../../game";

export class EggAmulet extends Equipment {
    constructor() {
        super();
        this.texture = AccessoriesSpriteSheet["egg_amulet.png"];
        this.equipmentType = EQUIPMENT_TYPE.ACCESSORY;
        this.id = EQUIPMENT_ID.EGG_AMULET;
        this.name = "Egg Amulet";
        this.description = "Summons chicken minion that deals 0.5 damage to enemies it touches\nAdds one more chicken whenever you enter a new floor";
        this.rarity = RARITY.B;
        this.minions = [new ChickenMinion()];
    }

    onNextLevel(wielder) {
        super.onNextLevel(wielder);
        const minion = new ChickenMinion();
        this.minions.push(minion);
        minion.activate(wielder);
    }
}

class ChickenMinion extends Minion {
    constructor(texture = AccessoriesSpriteSheet["chicken_minion.png"]) {
        super(texture);
        this.stepping = true;
        this.tallModifier -= 3;
    }

    activate(wielder, startingPoint = wielder.tilePosition) {
        super.activate(wielder, startingPoint);
        if (wielder === Game.player2) this.texture = AccessoriesSpriteSheet["chicken_minion_2.png"];
        else this.texture = AccessoriesSpriteSheet["chicken_minion.png"];
    }
}