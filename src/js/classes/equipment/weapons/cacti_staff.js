import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {Minion} from "../minion";
import {MinionStaff} from "./minion_staff";
import {randomChoice} from "../../../utils/random_utils";
import {get8Directions} from "../../../utils/map_utils";

export class CactiStaff extends MinionStaff {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["cacti_staff.png"];
        this.id = EQUIPMENT_ID.CACTI_STAFF;
        this.name = "Cacti Staff";
        this.createDescription("Cactus minions deal 0.5 damage to enemies they touch", "Cacti");
        this.rarity = RARITY.B;
        this.minions = [new CactiStaffMinion(), new CactiStaffMinion()];
        for (const minion of this.minions) {
            minion.brothers = this.minions.filter(m => m !== minion);
        }
    }
}

class CactiStaffMinion extends Minion {
    constructor(texture = WeaponsSpriteSheet["cactus_minion.png"]) {
        super(texture);
        this.stepping = true;
        this.tallModifier -= 3;
        this.brothers = [];
    }

    activate(wielder) {
        // pick a random diagonal tile that was not picked by other cacti
        let startingPoint = randomChoice(get8Directions().filter(dir => dir.x !== 0 && dir.y !== 0
            && this.brothers.every(bro => bro.tilePosition.x !== dir.x + wielder.tilePosition.x || bro.tilePosition.y !== dir.y + wielder.tilePosition.y)));
        // if something went wrong just pick any direction then
        if (startingPoint === undefined) {
            startingPoint = randomChoice(get8Directions());
        }

        startingPoint.x += wielder.tilePosition.x;
        startingPoint.y += wielder.tilePosition.y;
        super.activate(wielder, startingPoint);
    }
}