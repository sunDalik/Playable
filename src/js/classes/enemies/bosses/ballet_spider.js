import {Game} from "../../../game"
import {ENEMY_TYPE} from "../../../enums";
import {Boss} from "./boss";

export class BalletSpider extends Boss {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/bosses/ballet_spider/neutral.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.BALLET_SPIDER;
        this.atk = 0.5;
    }

    move() {

    }

    fitToTile() {
        super.fitToTile();
    }

    place() {
        super.place();
    }

    placeOnMap() {
        super.placeOnMap();
    }

    removeFromMap() {
        super.removeFromMap();
    }
}