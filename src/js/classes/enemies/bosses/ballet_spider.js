import {Game} from "../../../game"
import {ENEMY_TYPE} from "../../../enums/enums";
import {Boss} from "./boss";

export class BalletSpider extends Boss {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/bosses/ballet_spider/neutral.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 15;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.BALLET_SPIDER;
        this.atk = 1;
        this.name = "Ballet Spider";
    }

    move() {

    }
}