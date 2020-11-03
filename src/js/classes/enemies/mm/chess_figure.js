import {Enemy} from "../enemy";

export class ChessFigure extends Enemy {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.shadowInside = true;
        this.regenerateShadow();
    }

    setUpChessFigure(alignment, direction) {
    }

    getMoves() {

    }

    setStun(stun) {
    }

    setStunIcon() {
        super.setStunIcon();
        this.intentIcon.visible = false;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.visible = false;
    }

    setQuirk(quirk) {
    }
}