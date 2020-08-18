import {DCEnemiesSpriteSheet} from "../../../loader";
import {Roller} from "../fc/roller";
import {Bomb} from "../../equipment/bag/bomb";

export class BombSkull extends Roller {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["bomb_skull.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.setScaleModifier(1);
        this.slider = false;
        this.bomber = false;
        if (Math.random() < 0.1) {
            this.bomber = true;
            this.texture = DCEnemiesSpriteSheet["bomb_skull_bomber.png"];
        }
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

    die(source) {
        super.die(source);

        if (this.bomber) {
            new Bomb().useItem(this);
        }
    }
}