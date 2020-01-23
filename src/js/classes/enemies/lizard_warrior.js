import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";

export class LizardWarrior extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/lizard_warrior.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.LIZARD_WARRIOR;
        this.atk = 1.5;

        this.scaleModifier = 1.1;
        this.fitToTile();
    }

    move() {
    }

    updateIntentIcon() {
        super.updateIntentIcon();
    }
}