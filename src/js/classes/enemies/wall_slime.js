import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";

export class WallSlime extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/wall_slime.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3; //???
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.WALL_SLIME;
        this.atk = 1;

        this.turnDelay = 5;
        this.currentTurnDelay = this.turnDelay;
    }

    afterMapGen() {
        //idk
    }

    move() {
        //hmmm
    }

    updateIntentIcon() {
        super.updateIntentIcon();
    }
}