import {Star} from "./star"
import {ENEMY_TYPE} from "../../../enums/enums";
import {getPlayerOnTile} from "../../../map_checks";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";

export class RedStar extends Star {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["star_b.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.type = ENEMY_TYPE.STAR_RED;
        this.intentIcon2 = this.createIntentIcon();
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.triggered) this.attack();
            else {
                loop: for (let x = -3; x <= 3; x++) {
                    for (let y = -3; y <= 3; y++) {
                        if (!(Math.abs(x) === 3 || Math.abs(y) === 3) || (Math.abs(y) === 2 && Math.abs(x) === 3) || (Math.abs(x) === 2 && Math.abs(y) === 3)) {
                            if (getPlayerOnTile(this.tilePosition.x + x, this.tilePosition.y + y)) {
                                this.triggered = true;
                                break loop;
                            }
                        }
                    }
                }
                if (this.triggered) this.shake(1, 0);
            }
        } else this.turnDelay--;
    }

    attack() {
        this.triggered = false;
        this.attackCardinal();
        this.attackDiagonal();
        this.turnDelay = 2;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon2.visible = !this.dead;
        this.intentIcon.angle = this.intentIcon2.angle = 0;
        if (this.triggered) {
            this.intentIcon.texture = IntentsSpriteSheet["spikes.png"];
            this.intentIcon.angle = 45;
            this.intentIcon2.texture = IntentsSpriteSheet["spikes.png"];
        } else {
            this.intentIcon2.visible = false;
        }
    }
}