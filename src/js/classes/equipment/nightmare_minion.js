import {Minion} from "./minion";
import {WeaponsSpriteSheet} from "../../loader";
import {removeObjectFromArray} from "../../utils/basic_utils";
import {runDestroyAnimation} from "../../animations";

export class NightmareMinion extends Minion {
    constructor(texture = WeaponsSpriteSheet["nightmare_minion.png"]) {
        super(texture);
        this.stepping = false;
        this.removeShadow();
        this.alpha = 0.7;
        this.temporary = true;
        this.fadingDestructionParticles = true;
    }

    attack(summonItem) {
        if (super.attack(summonItem)) {
            this.die(summonItem);
        }
    }

    die(summonItem) {
        runDestroyAnimation(this);
        removeObjectFromArray(this, summonItem.minions);
        this.deactivate();
    }
}