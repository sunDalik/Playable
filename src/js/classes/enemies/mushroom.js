import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {Enemy} from "./enemy";

export class Mushroom extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/mushroom.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.MUSHROOM;
        this.atk = 0;
    }

    move() {

    }
}