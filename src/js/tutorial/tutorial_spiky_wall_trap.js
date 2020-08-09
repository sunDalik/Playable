import {SpikyWallTrap} from "../classes/enemies/fc/spiky_wall_trap";

export class TutorialSpikyWallTrap extends SpikyWallTrap {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
    }

    onTutorialPlayerRevive() {
        this.currentTurnDelay = 0;
        this.triggered = false;
        this.updateTexture();
        this.spikesSprite.visible = false;
        if (this.visible) this.updateIntentIcon();
        this.cancelAnimation();
    }
}