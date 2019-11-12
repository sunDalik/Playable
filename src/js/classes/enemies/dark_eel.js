import {Game} from "../../game"
import {Eel} from "./eel"
import {ENEMY_TYPE} from "../../enums";

export class DarkEel extends Eel {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/eel_dark.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.atk = 1.5;
        this.type = ENEMY_TYPE.DARK_EEL;
        this.scaleModifier = 1;
        this.fitToTile();
    }
}