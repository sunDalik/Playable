import {Game} from "../../../game"
import {Spider} from "../fc/spider"
import {ENEMY_TYPE} from "../../../enums";
import {isEmpty, isNotAWall} from "../../../map_checks";
import {DTEnemiesSpriteSheet} from "../../../loader";

export class RedSpider extends Spider {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["spider_red.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SPIDER_RED;
        this.damageable = false;
        this.devilJumped = false;
    }

    move() {
        if (!this.devilJumped) {
            this.damageable = false;
        }
        this.devilJumped = false;
        super.move();
    }

    damage(source, dmg, inputX, inputY, magical, hazardDamage = false) {
        if (this.damageable || magical || hazardDamage) {
            super.damage(source, dmg, inputX, inputY, magical, hazardDamage);
        } else {
            if (this.devilJump(source, inputX, inputY)) {
                this.devilJumped = true;
                this.damageable = true;
            } else if (!(super.throwAway(inputX, inputY) || this.graySpiderThrow(inputX, inputY) || this.greenSpiderThrow(inputX, inputY))) {
                this.microJump();
                this.thrown = true;
                this.cancellable = false;
            }
        }
    }

    devilJump(player, inputX, inputY) {
        if (isEmpty(player.tilePosition.x - inputX, player.tilePosition.y - inputY)) {
            this.throwStep(player.tilePosition.x - inputX - this.tilePosition.x, player.tilePosition.y - inputY - this.tilePosition.y);
        } else if (isEmpty(player.tilePosition.x - inputY, player.tilePosition.y - inputX)) {
            this.throwStep(player.tilePosition.x - inputY - this.tilePosition.x, player.tilePosition.y - inputX - this.tilePosition.y);
        } else if (isEmpty(player.tilePosition.x + inputY, player.tilePosition.y + inputX)) {
            this.throwStep(player.tilePosition.x + inputY - this.tilePosition.x, player.tilePosition.y + inputX - this.tilePosition.y);
        } else return false;
        return true;
    }

    graySpiderThrow(throwX, throwY) {
        if (throwX !== 0 || throwY !== 0) {
            if (isEmpty(this.tilePosition.x + throwX * 2, this.tilePosition.y + throwY * 2)
                && isNotAWall(this.tilePosition.x + throwX, this.tilePosition.y + throwY)) {
                this.throwStep(throwX * 2, throwY * 2);
                return true;
            }
        }
        return false;
    }

    greenSpiderThrow(throwX, throwY) {
        if (throwX !== 0 || throwY !== 0) {
            if (isEmpty(this.tilePosition.x + throwY, this.tilePosition.y + throwX)) {
                this.throwStep(throwY, throwX);
                return true;
            } else if (isEmpty(this.tilePosition.x - throwY, this.tilePosition.y - throwX)) {
                this.throwStep(-throwY, -throwX);
                return true;
            }
        }
        return false;
    }
}