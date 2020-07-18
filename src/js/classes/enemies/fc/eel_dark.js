import {Eel} from "./eel"
import {ENEMY_TYPE} from "../../../enums/enums";
import {FCEnemiesSpriteSheet} from "../../../loader";

export class DarkEel extends Eel {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["eel_dark.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 3;
        this.atk = 1.5;
        this.type = ENEMY_TYPE.DARK_EEL;
    }
}