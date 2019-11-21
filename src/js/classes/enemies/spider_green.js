import {Game} from "../../game"
import {Spider} from "./spider"
import {ENEMY_TYPE} from "../../enums";
import {isEmpty} from "../../map_checks";

export class SpiderGreen extends Spider {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/spider_green.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SPIDER_GREEN;
    }

    throwAway(throwX, throwY) {
        if (this.stun === 0) {
            if (throwX !== 0 || throwY !== 0) {
                if (isEmpty(this.tilePosition.x + throwY, this.tilePosition.y + throwX)) {
                    this.throwStep(throwY, throwX);
                } else if (isEmpty(this.tilePosition.x - throwY, this.tilePosition.y - throwX)) {
                    this.throwStep(-throwY, -throwX);
                }
            }
        }
    }
}