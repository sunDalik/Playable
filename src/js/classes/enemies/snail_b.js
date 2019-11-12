import {Game} from "../../game"
import {Snail} from "./snail"
import {ENEMY_TYPE} from "../../enums";

export class SnailB extends Snail {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/snail_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.atk = 1.5;
        this.type = ENEMY_TYPE.SNAIL_B;
    }
}