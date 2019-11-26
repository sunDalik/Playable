import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";

export class Rabbit extends Enemy {
    constructor(tilePositionX, tilePositionY, type, texture = Game.resources["src/images/enemies/rabbit.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 0.5;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.RABBIT;
        this.rabbitType = type;
        this.atk = 0.25;
        this.direction = 1;
    }

    move() {
    }
}