import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums";
import {RUEnemiesSpriteSheet} from "../../../loader";

export class BladeDemon extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["blade_demon.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 6;
        this.type = ENEMY_TYPE.BLADE_DEMON;
    }

    move() {

    }

    updateIntentIcon() {
        super.updateIntentIcon();

    }

}