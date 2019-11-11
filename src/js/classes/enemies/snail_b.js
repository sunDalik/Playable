import {Game} from "../../game"
import {Snail} from "./snail"
import {ENEMY_TYPE} from "../../enums";

export class SnailB extends Snail {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/enemies/snail_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.atk = 1.5;
        this.this = ENEMY_TYPE.SNAIL_B;
        this.turnDelay = 0;
        this.chase = false;
    }
}