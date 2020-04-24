import {Game} from "../../../game"
import {Spider} from "../fc/spider"
import {ENEMY_TYPE} from "../../../enums";
import {isEmpty} from "../../../map_checks";
import {DTEnemiesSpriteSheet} from "../../../loader";

export class GreenSpider extends Spider {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["spider_green.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 2;
        this.type = ENEMY_TYPE.SPIDER_GREEN;
    }

    throwAway(throwX, throwY) {
        if (throwX !== 0 || throwY !== 0) {
            if (isEmpty(this.tilePosition.x + throwY, this.tilePosition.y + throwX)) {
                this.throwStep(throwY, throwX);
            } else if (isEmpty(this.tilePosition.x - throwY, this.tilePosition.y - throwX)) {
                this.throwStep(-throwY, -throwX);
            }
        }
    }
}