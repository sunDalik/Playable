import {Cocoon} from "../classes/enemies/fc/cocoon";
import {Game} from "../game";
import {updateIntent} from "../game_logic";
import {TutorialSpider} from "./tutorial_spider";

export class TutorialCocoon extends Cocoon {
    constructor(tilePositionX, tilePositionY) {
        super(tilePositionX, tilePositionY);
    }

    move() {
        if (this.minion === null) {
            this.minion = new this.minionType(this.tilePosition.x - 1, this.tilePosition.y);
            Game.world.addEnemy(this.minion, true);
            this.minion.setStun(0);
            this.minion.noticeDistance = 99;
            updateIntent(this.minion);
        }
    }

    setMinionType() {
        this.minionType = TutorialSpider;
    }
}