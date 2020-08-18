import {DCEnemiesSpriteSheet} from "../../../loader";
import {Roller} from "../fc/roller";
import {Bomb} from "../../equipment/bag/bomb";
import {ENEMY_TYPE} from "../../../enums/enums";

export class BombSkull extends Roller {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["bomb_skull.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.setScaleModifier(1);
        this.slider = false;
        this.bomber = false;
        this.name = "Bomb Skull";
        this.type = ENEMY_TYPE.BOMB_SKULL;
        if (Math.random() < 0.3) {
            this.bomber = true;
            this.texture = DCEnemiesSpriteSheet["bomb_skull_bomber.png"];
        }
        this.tallModifier = -2;
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