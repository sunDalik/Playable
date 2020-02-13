import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";

export class PingPongBuddy extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/ping_pong_buddy.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.PING_PONG_BUDDY;
        this.atk = 1;
    }

    afterMapGen() {
        //idk
    }

    move() {
        //...
    }

    updateIntentIcon() {
        super.updateIntentIcon();
    }
}