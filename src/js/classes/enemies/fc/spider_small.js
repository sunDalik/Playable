import {Spider} from "./spider";
import {ENEMY_TYPE} from "../../../enums/enums";
import {FCEnemiesSpriteSheet} from "../../../loader";

export class SpiderSmall extends Spider {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["spider_small.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 0.25;
        this.name = "Small Spider";
        this.atk = 0.75;
        this.type = ENEMY_TYPE.SPIDER_SMALL;
    }
}