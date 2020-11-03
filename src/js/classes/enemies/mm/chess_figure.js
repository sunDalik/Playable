import {Enemy} from "../enemy";
import {getPlayerOnTile} from "../../../map_checks";
import {tileDistanceDiagonal} from "../../../utils/game_utils";

export class ChessFigure extends Enemy {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.shadowInside = true;
        this.cachedMoves = [];
        this.regenerateShadow();
        this.sliding = true;
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
            if (tileDistanceDiagonal(this, player, 1) === 1) {
                this.bumpOrSlideBumpTo(x, y);
            } else {
                const moveDir = {x: x - this.tilePosition.x, y: y - this.tilePosition.y};
                this.stepOrSlideTo(x - moveDir.x, y - moveDir.y);
            }
        } else {
            this.stepOrSlideTo(x, y);
        }
        this.cancellable = false;
    }

    stepOrSlideTo(x, y) {
        if (this.sliding) {
            this.slide(x - this.tilePosition.x, y - this.tilePosition.y);
        } else {
            this.step(x - this.tilePosition.x, y - this.tilePosition.y);
        }
    }

    bumpOrSlideBumpTo(x, y) {
        if (this.sliding) {
            this.slideBump(x - this.tilePosition.x, y - this.tilePosition.y);
        } else {
            this.bump(x - this.tilePosition.x, y - this.tilePosition.y);
        }
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