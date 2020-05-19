import {redrawSlotContents} from "../../../drawing/draw_hud";
import {SLOT} from "../../../enums";
import {Equipment} from "../equipment";

export class AbstractShield extends Equipment {
    constructor() {
        super();
    }

    activate(wielder) {
        if (this.uses <= 0) return false;
        this.uses--;
        wielder.spinItem(this);
        redrawSlotContents(wielder, SLOT.EXTRA);
        return true;
    }

    onBlock(source, wielder) {
    }

    onNextLevel(player) {
        this.uses += Math.ceil(this.maxUses / 2);
        if (this.uses > this.maxUses) this.uses = this.maxUses;
        redrawSlotContents(player, SLOT.EXTRA);
    }
}