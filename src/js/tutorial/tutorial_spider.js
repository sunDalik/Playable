import {Spider} from "../classes/enemies/fc/spider";

export class TutorialSpider extends Spider {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
        this.originalPosition = {x: tilePositionX, y: tilePositionY};
    }

    onTutorialPlayerRevive() {
        if (!this.dead) {
            this.cancelAnimation();
            this.setTilePosition(this.originalPosition.x, this.originalPosition.y);
            this.health = this.maxHealth;
            this.healthContainer.visible = false;
        }
    }
}