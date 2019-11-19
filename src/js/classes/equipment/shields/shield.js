import {redrawSecondHand} from "../../../drawing/draw_hud";

export class Shield {
    constructor() {
        this.maxUses = undefined;
        this.uses = this.maxUses;
    }

    activate(wielder) {
        if (this.uses <= 0) return false;
        this.uses--;
        redrawSecondHand(wielder);
        return true;
    }

    onBlock(source, wielder) {
    }

    onNextLevel(player) {
        this.recover(player);
    }

    recover(player) {
        this.uses += Math.ceil(this.maxUses / 2);
        if (this.uses > this.maxUses) this.uses = this.maxUses;
        redrawSecondHand(player)
    }
}