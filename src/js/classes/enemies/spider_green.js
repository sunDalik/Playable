import {Game} from "../../game"
import {Spider} from "./spider"
import {ENEMY_TYPE} from "../../enums";
import {isEmpty, isNotAWall} from "../../map_checks";

export class SpiderGreen extends Spider {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/spider_green.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SPIDER_GREEN;
    }


}