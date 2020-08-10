import {SpiderSmall} from "../classes/enemies/fc/spider_small";
import {Game} from "../game";
import {darkenTile} from "../drawing/lighting";

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
            this.setStun(1);

            if (Game.map[11][21].tile && Game.map[11][21].tile.close) Game.map[11][21].tile.close();
            for (let x = 13; x <= 20; x++) {
                for (let y = 10; y <= 14; y++) {
                    darkenTile(x, y);
                }
            }
        }
    }
}