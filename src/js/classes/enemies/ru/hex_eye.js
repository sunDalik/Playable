import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums";
import {RUEnemiesSpriteSheet} from "../../../loader";

export class HexEye extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["hex_eye.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 4;
        this.type = ENEMY_TYPE.HEX_EYE;
    }

    move() {

    }

    updateIntentIcon() {
        super.updateIntentIcon();

    }

}