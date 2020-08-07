import {Spider} from "../fc/spider";
import {ENEMY_TYPE} from "../../../enums/enums";
import {isEmpty, isNotAWall} from "../../../map_checks";
import {DTEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {DAMAGE_TYPE} from "../../../enums/damage_type";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";

export class RedSpider extends Spider {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["spider_red.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 1;
        this.name = "Red Spider";
        this.type = ENEMY_TYPE.SPIDER_RED;
        this.damageable = false;
        this.intentIcon2 = this.createIntentIcon();
    }

    damage(source, dmg, inputX, inputY, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        if (this.damageable || this.stun > 0 || !damageType.weaponal || !source || tileDistance(source, this) > 3) {
            super.damage(source, dmg, inputX, inputY, damageType);
        } else {
            if (this.devilJump(source, inputX, inputY)) {
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

    updateIntentIcon() {
        super.updateIntentIcon();
        if (!this.damageable && tileDistance(this, closestPlayer(this)) <= this.noticeDistance) {
            this.intentIcon2.visible = true;
            this.intentIcon2.zIndex = this.intentIcon.zIndex + 1;
            this.intentIcon2.texture = IntentsSpriteSheet["magic.png"];
            this.intentIcon2.alpha = 0.6;
        } else {
            this.intentIcon2.visible = false;
        }
    }
}