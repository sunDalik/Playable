import {Game} from "../../game"
import {Spider} from "./spider"
import {ENEMY_TYPE} from "../../enums";
import {isEmpty, isNotAWall} from "../../map_checks";

export class SpiderB extends Spider {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/spider_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SPIDER_B;
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