import {Spider} from "./spider";
import {ENEMY_TYPE} from "../../../enums/enums";
import {isEmpty, isNotAWall} from "../../../map_checks";
import {FCEnemiesSpriteSheet} from "../../../loader";

export class GraySpider extends Spider {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["spider_b.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 3;
        this.type = ENEMY_TYPE.SPIDER_GRAY;
    }

    throwAway(throwX, throwY) {
        if (throwX !== 0 || throwY !== 0) {
            if (isEmpty(this.tilePosition.x + throwX * 2, this.tilePosition.y + throwY * 2)
                && isNotAWall(this.tilePosition.x + throwX, this.tilePosition.y + throwY)) {
                this.throwStep(throwX * 2, throwY * 2);
            } else if (isEmpty(this.tilePosition.x + throwX, this.tilePosition.y + throwY)) {
                this.throwStep(throwX, throwY);
            }
        }
    }
}