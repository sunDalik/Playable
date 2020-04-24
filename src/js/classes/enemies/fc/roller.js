import {Game} from "../../../game"
import {Enemy} from "../enemy"
import {ENEMY_TYPE, TILE_TYPE} from "../../../enums";
import {getPlayerOnTile, isAnyWall, isInanimate, isRelativelyEmpty} from "../../../map_checks";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {quadraticBezier} from "../../../utils/math_utils";

export class Roller extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["roller.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 1;
        this.atk = 1;
        this.direction = 1;
        this.SLIDE_ANIMATION_TIME = 6;
        this.type = ENEMY_TYPE.ROLLER;
        this.setScaleModifier(0.85);
    }

    cancelAnimation() {
        super.cancelAnimation();
        this.correctScale();
    }

    afterMapGen() {
        if (isAnyWall(this.tilePosition.x + 1, this.tilePosition.y)
            || isInanimate(this.tilePosition.x + 1, this.tilePosition.y)) {
            this.direction = -1;
            this.scale.x = Math.abs(this.scale.x) * -1;
        }
    }

    move() {
        if (isRelativelyEmpty(this.tilePosition.x + this.direction, this.tilePosition.y)
            && Game.map[this.tilePosition.y][this.tilePosition.x + this.direction].tileType !== TILE_TYPE.ENTRY) {
            let player = getPlayerOnTile(this.tilePosition.x + this.direction, this.tilePosition.y);
            if (player !== null) {
                player.damage(this.atk, this);
                this.rollBump();
            } else {
                this.slide(this.direction, 0);
            }
        } else this.rollBump();
    }

    correctScale() {
        this.scale.x = this.direction * Math.abs(this.scale.x);
    }

    rollBump() {
        const slideAnimationTime = 3;
        const bumpAnimationTime = 11;
        const slideDistance = slideAnimationTime / this.SLIDE_ANIMATION_TIME * Game.TILESIZE;
        const oldPositionX = this.position.x;
        const oldPositionY = this.position.y;
        this.direction *= -1;
        const jumpHeight = Game.TILESIZE * 1.2;
        let counter = 0;

        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            if (counter < slideAnimationTime) {
                this.position.x = oldPositionX + (counter / slideAnimationTime) * slideDistance * -this.direction;
            } else if (counter >= slideAnimationTime) {
                this.correctScale();
                const t = (counter - slideAnimationTime) / bumpAnimationTime;
                this.position.x = quadraticBezier(t, oldPositionX + slideDistance * -this.direction, oldPositionX + slideDistance / 2 * -this.direction, oldPositionX);
                this.position.y = quadraticBezier(t, oldPositionY, oldPositionY - jumpHeight, oldPositionY);
            }

            if (counter >= slideAnimationTime + bumpAnimationTime) {
                Game.app.ticker.remove(animation);
                this.place();
            }
            this.onMoveFrame();
        };

        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.texture = IntentsSpriteSheet["arrow_right.png"];
        this.intentIcon.angle = this.getArrowRightAngleForDirection({x: this.direction, y: 0});
    }
}