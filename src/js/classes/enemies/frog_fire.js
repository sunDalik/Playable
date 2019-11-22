import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {Frog} from "./frog";

export class FireFrog extends Frog {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/frog_fire.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.FROG_FIRE;
        this.atk = 1;
    }
}