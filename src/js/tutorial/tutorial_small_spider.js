import {SpiderSmall} from "../classes/enemies/fc/spider_small";
import {Game} from "../game";

export class TutorialSmallSpider extends SpiderSmall {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
        this.originalPosition = {x: tilePositionX, y: tilePositionY};
        this.noticeDistance = 99;
        this.companionSpiders = [];
        this.active = false;
    }

    move() {
        super.move();
        this.active = true;
    }

    onTutorialPlayerRevive() {
        if (this.companionSpiders.every(s => s.dead)) return;

        if (this.active) {
            this.visible = true;
            this.dead = false;
            Game.world.addChild(this);
            this.cancelAnimation();
            this.setTilePosition(this.originalPosition.x, this.originalPosition.y);
            this.health = this.maxHealth;
            this.healthContainer.visible = false;
        }
    }
}