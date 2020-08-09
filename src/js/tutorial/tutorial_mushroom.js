import {Mushroom} from "../classes/enemies/fc/mushroom";

export class TutorialMushroom extends Mushroom {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
        this.poisonDelay = 8;
    }

    move() {
        if (this.currentPoisonDelay <= 0) {
            this.spillPoison();
            this.currentPoisonDelay = this.poisonDelay;
        } else {
            this.currentPoisonDelay--;
        }
    }

    onTutorialPlayerRevive() {
        this.health = this.maxHealth;
        this.healthContainer.visible = false;
    }
}