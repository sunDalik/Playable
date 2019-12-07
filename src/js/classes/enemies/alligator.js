import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, RABBIT_TYPE} from "../../enums";

export class Alligator extends Enemy {
    constructor(tilePositionX, tilePositionY, type = undefined, texture = Game.resources["src/images/enemies/alligator_x.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.ALLIGATOR;
        this.alligatorType = type;
        this.atk = 1;
        this.turnDelay = 2;
        this.currentTurnDelay = 0;
        this.prey = null;
        this.direction = {x: 1, y: 0};
        this.seen = false;
        this.correctScale();
    }

    move() {
        if (!this.seen) {
            this.seen = true;
            //initialize
        }
        if (this.prey && !this.prey.dead) {

            if (true) {
                this.prey = null;
            }
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