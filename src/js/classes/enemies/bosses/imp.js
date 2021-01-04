import {ENEMY_TYPE} from "../../../enums/enums";
import {Boss} from "./boss";
import {FCEnemiesSpriteSheet, InanimatesSpriteSheet} from "../../../loader";

export class Imp extends Boss {
    constructor(tilePositionX, tilePositionY, texture = InanimatesSpriteSheet["shrine_of_imp.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 10;
        this.type = ENEMY_TYPE.IMP;
        this.name = "Imp";
        this.atk = 1;
        this.setScaleModifier(1.5);
        this.tallModifier = -10;
    }

    move() {

    }
}