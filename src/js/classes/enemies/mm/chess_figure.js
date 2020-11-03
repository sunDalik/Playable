import {Enemy} from "../enemy";
import {getPlayerOnTile} from "../../../map_checks";

export class ChessFigure extends Enemy {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.shadowInside = true;
        this.cachedMoves = [];
        this.regenerateShadow();
    }

    setUpChessFigure(alignment, direction) {
    }

    getMoves(x, y) {
        return [];
    }

    moveTo(x, y) {
        const player = getPlayerOnTile(x, y);
        if (player) {
            player.damage(this.atk, this, true);
        } else {
            this.slide(x - this.tilePosition.x, y - this.tilePosition.y);
        }
        this.cancellable = false;
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