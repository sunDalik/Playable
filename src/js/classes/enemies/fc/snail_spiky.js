import {Game} from "../../../game"
import {Snail} from "./snail"
import {ENEMY_TYPE} from "../../../enums";
import {FCEnemiesSpriteSheet} from "../../../loader";

export class SpikySnail extends Snail {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["snail_spiky.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 5;
        this.currentTurnDelay = this.turnDelay = 2;
        this.atk = 1.5;
        this.type = ENEMY_TYPE.SNAIL_SPIKY;
    }
}