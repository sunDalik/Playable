import {Game} from "../../game"
import {Spider} from "./spider"
import {ENEMY_TYPE} from "../../enums";
import {getPlayerOnTile, isNotAWall, isRelativelyEmpty} from "../../mapChecks";

export class SpiderB extends Spider {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/enemies/spider_b.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.this = ENEMY_TYPE.SPIDER_B;
        this.chase = false;
    }

    throwAway(throwX, throwY) {
        if (this.stun === 0) {
            if (throwX !== 0) {
                if (isRelativelyEmpty(this.tilePosition.x + throwX + Math.sign(throwX), this.tilePosition.y)
                    && getPlayerOnTile(this.tilePosition.x + throwX + Math.sign(throwX), this.tilePosition.y) === null
                    && isNotAWall(this.tilePosition.x + throwX, this.tilePosition.y)) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepX(throwX + Math.sign(throwX));
                    this.thrown = true;
                    this.cancellable = false;
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
                } else if (isRelativelyEmpty(this.tilePosition.x + throwX, this.tilePosition.y) && getPlayerOnTile(this.tilePosition.x + throwX, this.tilePosition.y) === null) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepX(throwX);
                    this.thrown = true;
                    this.cancellable = false;
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
                }
            } else if (throwY !== 0) {
                if (isRelativelyEmpty(this.tilePosition.x, this.tilePosition.y + throwY + Math.sign(throwY))
                    && getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + throwY + Math.sign(throwY)) === null
                    && isNotAWall(this.tilePosition.x, this.tilePosition.y + throwY)) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepY(throwY + Math.sign(throwY));
                    this.thrown = true;
                    this.cancellable = false;
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
                } else if (isRelativelyEmpty(this.tilePosition.x, this.tilePosition.y + throwY) && getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + throwY) === null) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.stepY(throwY);
                    this.thrown = true;
                    this.cancellable = false;
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
                }
            }
        }
    }
}