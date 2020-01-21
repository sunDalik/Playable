import {Game} from "../../game"
import {Snail} from "./snail"
import {ENEMY_TYPE} from "../../enums";

export class SpikySnail extends Snail {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/snail_spiky.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 5;
        this.health = this.maxHealth;
        this.turnDelay = 2;
        this.atk = 1.5;
        this.type = ENEMY_TYPE.SNAIL_SPIKY;
        this.currentTurnDelay = this.turnDelay;
    }
}