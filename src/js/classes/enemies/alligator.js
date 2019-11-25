import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";

export class Alligator extends Enemy {
    constructor(tilePositionX, tilePositionY, prey, texture = Game.resources["src/images/enemies/alligator.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.ALLIGATOR;
        this.atk = 1;
        this.turnDelay = 2;
        this.currentTurnDelay = 0;
        this.prey = prey;
        if (this.prey) {
            this.hunting = true;
            this.direction = prey.direction;
        } else {
            this.hunting = false;
            this.direction = 1;
        }
        this.seen = false;
        this.correctScale();
    }

    move() {
        if (!this.seen) {
            this.seen = true;
            //initialize
        }
        if (this.hunting) {

        } else if (this.currentTurnDelay === 0) {

            this.currentTurnDelay = this.turnDelay
        } else this.currentTurnDelay--;
    }

    correctScale() {
        if ((this.direction === 1 && this.scale.x < 0) || (this.direction === -1 && this.scale.x > .0)) {
            this.scale.x *= -1
        }
    }
}