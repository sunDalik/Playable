import {Minion} from "./minion";
import {WeaponsSpriteSheet} from "../../loader";
import {removeObjectFromArray} from "../../utils/basic_utils";
import {runDestroyAnimation} from "../../animations";

export class NightmareMinion extends Minion {
    constructor(texture = WeaponsSpriteSheet["nightmare_minion.png"]) {
        super(texture);
        this.stepping = false;
        this.hasShadow = false;
        this.alpha = 0.7;
        this.temporary = true;
        this.fadingDestructionParticles = true;
        this.tallModifier = 5;
        this.life = 2;
    }

    attack(summonItem) {
        if (super.attack(summonItem)) {
            this.life--;
            if (this.life <= 0) this.die(summonItem);
        }
    }

    die(summonItem) {
        runDestroyAnimation(this);
        removeObjectFromArray(this, summonItem.minions);
        this.deactivate();
    }
}