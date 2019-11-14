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
        if (this.stun === 0) {
            if (throwX !== 0) {
                if (isEmpty(this.tilePosition.x + throwX + Math.sign(throwX), this.tilePosition.y)
                    && isNotAWall(this.tilePosition.x + throwX, this.tilePosition.y)) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepX(throwX + Math.sign(throwX));
                    this.thrown = true;
                    this.cancellable = false;
                    this.updateMapPosition();
                } else if (isEmpty(this.tilePosition.x + throwX, this.tilePosition.y)) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepX(throwX);
                    this.thrown = true;
                    this.cancellable = false;
                    this.updateMapPosition();
                }
            } else if (throwY !== 0) {
                if (isEmpty(this.tilePosition.x, this.tilePosition.y + throwY + Math.sign(throwY))
                    && isNotAWall(this.tilePosition.x, this.tilePosition.y + throwY)) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepY(throwY + Math.sign(throwY));
                    this.thrown = true;
                    this.cancellable = false;
                    this.updateMapPosition();
                } else if (isEmpty(this.tilePosition.x, this.tilePosition.y + throwY)) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepY(throwY);
                    this.thrown = true;
                    this.cancellable = false;
                    this.updateMapPosition();
                }
            }
        }
    }
}