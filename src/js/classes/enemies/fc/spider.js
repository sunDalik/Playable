import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE, STAGE} from "../../../enums";
import {getPlayerOnTile, isEmpty} from "../../../map_checks";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {getChasingOptions, getRelativelyEmptyLitCardinalDirections} from "../../../utils/map_utils";
import {randomChoice} from "../../../utils/random_utils";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {easeInOutQuad} from "../../../utils/math_utils";

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
            if (tileDistance(this, closestPlayer(this)) <= this.noticeDistance) {
                const movementOptions = getChasingOptions(this, closestPlayer(this));
                if (movementOptions.length !== 0) {
                    const dir = randomChoice(movementOptions);
                    const player = getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
                    if (player) {
                        this.bump(dir.x, dir.y);
                        player.damage(this.atk, this, true);
                    } else {
                        this.step(dir.x, dir.y);
                    }
                } else this.bump(Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x), Math.sign(closestPlayer(this).tilePosition.y - this.tilePosition.y));
            } else {
                const movementOptions = getRelativelyEmptyLitCardinalDirections(this);
                if (movementOptions.length !== 0) {
                    const dir = randomChoice(movementOptions);
                    this.step(dir.x, dir.y);
                }
            }
        } else this.thrown = false;
    }

    damage(source, dmg, inputX, inputY, magical = false, hazardDamage = false) {
        super.damage(source, dmg, inputX, inputY, magical, hazardDamage);
        if (!this.dead && this.stun === 0 && !magical) this.throwAway(inputX, inputY);
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