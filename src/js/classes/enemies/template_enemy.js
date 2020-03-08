import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";

export class TemplateEnemy extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/image.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 0;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.YOUR_TYPE;
        this.atk = 0;

        //optional
        this.turnDelay = 1;
        this.currentTurnDelay = this.turnDelay;
        this.movable = false;
        this.fadingDestructionParticles = true;
        this.energyDrop = 0;
        this.canMoveInvisible = true;
        this.fireImmunity = 0;
        this.electricityImmunity = 0;
        this.poisonImmunity = 0;
        this.scaleModifier = 0.8;
        this.fitToTile();
    }

    //executes once after the entire map has been generated
    afterMapGen() {
    }

    //main function
    move() {
    }

    updateIntentIcon() {
        super.updateIntentIcon();
    }
}