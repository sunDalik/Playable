import {ENEMY_TYPE} from "../../../enums/enums";
import {DCEnemiesSpriteSheet} from "../../../loader";
import {Scorpion} from "./scorpion";

export class RedScorpion extends Scorpion {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["red_scorpion.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 2;
        this.name = "Red Scorpion";
        this.type = ENEMY_TYPE.RED_SCORPION;
        this.atk = 1.25;
    }
}