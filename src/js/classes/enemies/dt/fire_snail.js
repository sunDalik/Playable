import {ENEMY_TYPE} from "../../../enums";
import {DTEnemiesSpriteSheet} from "../../../loader";
import {Snail} from "../fc/snail";

export class FireSnail extends Snail {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["fire_snail.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 6;
        this.type = ENEMY_TYPE.FIRE_SNAIL;
        this.atk = 1.5;
    }

    move() {
        super.move();
    }

    die(source) {
        return super.die(source);
    }
}