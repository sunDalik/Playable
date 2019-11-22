import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";

export class Frog extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/frog.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.FROG;
        this.atk = 1;
        this.turnDelay = 1;
        this.currentTurnDelay = 0;
        this.triggered = false;
        this.triggeredTile = null;
    }

    fitToTile() {
        const scaleX = Game.TILESIZE / this.getUnscaledWidth();
        const scaleY = Game.TILESIZE / this.getUnscaledHeight();
        this.scale.set(scaleX, scaleY);
    }

    move() {
    }
}