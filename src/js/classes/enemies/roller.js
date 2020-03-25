import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {getPlayerOnTile, isAnyWall, isInanimate, isRelativelyEmpty} from "../../map_checks";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../loader";

export class Roller extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["roller.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.atk = 1;
        this.direction = 1;
        this.SLIDE_ANIMATION_TIME = 6;
        this.BUMP_ANIMATION_TIME = 14;
        this.type = ENEMY_TYPE.ROLLER;
        this.setScaleModifier(0.85);
    }

    // super()??
    cancelAnimation() {
        Game.app.ticker.remove(this.animation);
        this.place();
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
        if (isRelativelyEmpty(this.tilePosition.x + this.direction, this.tilePosition.y)) {
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
        if ((this.direction === 1 && this.scale.x < 0) || (this.direction === -1 && this.scale.x > 0)) {
            this.scale.x *= -1
        }
    }

    rollBump() {
        const oldDirection = this.direction;
        this.direction *= -1;
        const oldStep = oldDirection * Game.TILESIZE / this.BUMP_ANIMATION_TIME;
        const newStep = oldStep * -1;
        const jumpHeight = Game.TILESIZE * 40 / 75;
        const a = jumpHeight / ((Game.TILESIZE / 2 / 3) ** 2);
        const b = -(this.position.x + (1 / 3) * oldDirection * Game.TILESIZE + (this.direction * Game.TILESIZE) / 2 / 3) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        let counter = 0;

        const animation = delta => {
            if (Game.paused) return;
            if (counter < this.BUMP_ANIMATION_TIME / 3) {
                this.position.x += oldStep * delta;
            } else if (counter >= this.BUMP_ANIMATION_TIME / 3 && counter < this.BUMP_ANIMATION_TIME) {
                this.correctScale();
                this.position.x += newStep / 2 * delta;
                this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            }
            counter += delta;
            if (counter >= this.BUMP_ANIMATION_TIME) {
                Game.app.ticker.remove(animation);
                this.place();
            }
            this.moveHealthContainer();
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