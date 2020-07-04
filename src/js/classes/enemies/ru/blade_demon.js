import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums";
import {RUEnemiesSpriteSheet} from "../../../loader";
import {randomAggressiveAI} from "../../../enemy_movement_ai";

export class BladeDemon extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["blade_demon.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 3;
        this.type = ENEMY_TYPE.BLADE_DEMON;
        this.currentTurnDelay = this.turnDelay = 2;
        this.cooldown = 1;
        this.noticeDistance = 7;
    }

    move() {
        randomAggressiveAI(this, this.noticeDistance);
    }

    updateIntentIcon() {
        super.updateIntentIcon();

    }

}