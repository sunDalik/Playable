import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {DAMAGE_TYPE, ENEMY_TYPE, STAGE} from "../../../enums";
import {isEmpty} from "../../../map_checks";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {easeInOutQuad} from "../../../utils/math_utils";
import {randomAggressiveAI} from "../../../enemy_movement_ai";

export class Spider extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["spider.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.type = ENEMY_TYPE.SPIDER;
        this.atk = 1;
        if (Game.stage !== STAGE.DARK_TUNNEL) {
            this.stun = 1;
        }
        this.thrown = false;
        this.noticeDistance = 4;
        this.shadowInside = true;
        this.STEP_ANIMATION_TIME = 6;
        this.BUMP_ANIMATION_TIME = 12;
        this.spiderLike = true;
        this.setScaleModifier(1.0625);
    }

    move() {
        if (!this.thrown) {
            randomAggressiveAI(this, this.noticeDistance);
        } else this.thrown = false;
    }

    damage(source, dmg, inputX, inputY, damageType = DAMAGE_TYPE.PHYSICAL) {
        super.damage(source, dmg, inputX, inputY, damageType);
        if (!this.dead && this.stun === 0 && damageType !== DAMAGE_TYPE.MAGICAL && damageType !== DAMAGE_TYPE.HAZARDAL) this.throwAway(inputX, inputY);
        if (Game.afterTurn) {
            this.thrown = false;
        }
    }

    throwAway(throwX, throwY) {
        if (throwX !== 0 || throwY !== 0) {
            if (isEmpty(this.tilePosition.x + throwX, this.tilePosition.y + throwY)) {
                this.throwStep(throwX, throwY);
                return true;
            }
        }
        return false;
    }

    throwStep(throwX, throwY) {
        this.step(throwX, throwY);
        this.thrown = true;
        this.cancellable = false;
    }

    idleAnimation() {
        return;
        const animationTime = 60;
        let counter = animationTime / 2;
        const originalScaleY = this.scale.y;
        const amplitude = originalScaleY * 0.06;
        let goUp = true;


        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            this.scale.y = originalScaleY * (counter % animationTime) * 2;

            if (goUp) this.scale.y = originalScaleY - amplitude + easeInOutQuad(counter / animationTime) * amplitude * 2;
            else this.scale.y = originalScaleY + amplitude - easeInOutQuad(counter / animationTime) * amplitude * 2;
            this.place();

            if (counter >= animationTime) {
                counter -= animationTime;
                if (goUp) this.scale.y = originalScaleY + amplitude;
                else this.scale.y = originalScaleY - amplitude;
                goUp = !goUp;
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.thrown) {
            this.intentIcon.texture = IntentsSpriteSheet["stun.png"];
        } else if (tileDistance(this, closestPlayer(this)) <= this.noticeDistance) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }
}