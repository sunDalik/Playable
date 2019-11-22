import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {Frog} from "./frog";

export class KingFireFrog extends Frog {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/frog_king_fire.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.FROG_KING_FIRE;
        this.atk = 1.25;
    }

    move() {
    }
}