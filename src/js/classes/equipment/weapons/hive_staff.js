import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {WeaponsSpriteSheet} from "../../../loader";
import {Minion} from "../minion";
import {MinionStaff} from "./minion_staff";

export class HiveStaff extends MinionStaff {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["hive_staff.png"];
        this.id = EQUIPMENT_ID.HIVE_STAFF;
        this.name = "Hive Staff";
        this.createDescription("Bee minions deal 0.5 damage to enemies they touch", "Bees");
        this.rarity = RARITY.A;
        this.minions = [new BeeMinion(), new BeeMinion(), new BeeMinion(), new BeeMinion()];
        for (let i = 0; i < this.minions.length; i++) {
            this.minions[i].order = i;
        }
    }
}

class BeeMinion extends Minion {
    constructor(texture = WeaponsSpriteSheet["bee_minion.png"]) {
        super(texture);
        this.stepping = false;
        this.tallModifier = 20;
        this.shadowWidthMul = 0.35;
        this.order = 0;
    }

    activate(wielder) {
        this.wielder = wielder;
        let startingPoint = {x: wielder.tilePosition.x, y: wielder.tilePosition.y};
        if (this.order === 0) {
            startingPoint.x -= 2;
            if (this.areAnyMinions(startingPoint.x, startingPoint.y)) {
                startingPoint.x += 1;
                startingPoint.y -= 1;
            }
        } else if (this.order === 1) {
            startingPoint.y -= 2;
            if (this.areAnyMinions(startingPoint.x, startingPoint.y)) {
                startingPoint.x += 1;
                startingPoint.y += 1;
            }
        } else if (this.order === 2) {
            startingPoint.x += 2;
            if (this.areAnyMinions(startingPoint.x, startingPoint.y)) {
                startingPoint.x -= 1;
                startingPoint.y += 1;
            }
        } else {
            startingPoint.y += 2;
            if (this.areAnyMinions(startingPoint.x, startingPoint.y)) {
                startingPoint.x -= 1;
                startingPoint.y -= 1;
            }
        }
        super.activate(wielder, startingPoint);
    }
}