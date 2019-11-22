import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {Frog} from "./frog";

export class KingFrog extends Frog {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/frog_king.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.FROG_KING;
        this.atk = 1.25;
    }

    move() {
    }
}