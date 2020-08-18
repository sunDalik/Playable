import {DCEnemiesSpriteSheet} from "../../../loader";
import {Roller} from "../fc/roller";

export class BombSkull extends Roller {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["bomb_skull.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.setScaleModifier(1);
        this.slider = false;
    }

    rollBump() {
        this.bump(this.direction, 0, () => {
            if (this.animationCounter >= this.BUMP_ANIMATION_TIME / 2) {
                this.correctScale();
            }
        }, () => {
            this.correctScale();
        });
        this.direction *= -1;
    }
}