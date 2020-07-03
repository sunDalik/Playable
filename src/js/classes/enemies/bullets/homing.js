import {Bullet} from "./bullet";
import {Game} from "../../../game";
import {ROLE} from "../../../enums";
import {BulletsSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {closestPlayer, getAngleForDirection, tileDistance} from "../../../utils/game_utils";
import {canBeFliedOverByBullet, getPlayerOnTile, isEnemy} from "../../../map_checks";
import {BIG_DARK_GLOW_FILTER, BIG_WHITE_GLOW_FILTER} from "../../../filters";

export class HomingBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, texture = BulletsSpriteSheet["homing_bullet.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.homing = true;
        this.unhomeDistance = 3;
        this.targetedPlayer = null;

        this.dir = {x: 1, y: 0};
        this.getBulletAngle();
    }

    move() {
        if (this.dead) return false;
        if (this.targetedPlayer === null) this.targetedPlayer = closestPlayer(this);

        if (this.delay <= 0) {
            const dirX = this.homing ? Math.sign(this.targetedPlayer.tilePosition.x - this.tilePosition.x) : this.dir.x;
            const dirY = this.homing ? Math.sign(this.targetedPlayer.tilePosition.y - this.tilePosition.y) : this.dir.y;
            this.dir = {x: dirX, y: dirY};
            const newX = this.tilePosition.x + dirX;
            const newY = this.tilePosition.y + dirY;
            if (isEnemy(newX, newY) || getPlayerOnTile(newX, newY) !== null) {
                this.attack(Game.map[newY][newX].entity);
            } else if (canBeFliedOverByBullet(newX, newY)) {
                this.fly(dirX, dirY);
            } else {
                this.die(false);
                this.dieFly(dirX, dirY, this.ANIMATION_TIME, 0.5);
            }

            if (this.homing && (this.targetedPlayer.dead || tileDistance(this, this.targetedPlayer) <= this.unhomeDistance)) {
                this.homing = false;
            }
        } else this.delay--;

        this.updateIntentIcon();
    }

    attack(entity) {
        if (entity.role === ROLE.ENEMY) {
            this.die(false);
            this.dieFly(entity.tilePosition.x - this.tilePosition.x, entity.tilePosition.y - this.tilePosition.y);
        } else super.attack(entity);
    }

    getBulletAngle() {
        if (!this.dir) return 0;
        return getAngleForDirection(this.dir);
    }

    updateIntentIcon() {
        this.intentIcon.visible = !this.dead;
        if (this.delay > 0) {
            this.intentIcon.visible = false;
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["arrow_right.png"];
            this.intentIcon.angle = getAngleForDirection(this.dir);
        }
        if (this.homing && this.targetedPlayer) {
            if (this.targetedPlayer === Game.player) this.intentIcon.filters = [BIG_WHITE_GLOW_FILTER];
            else this.intentIcon.filters = [BIG_DARK_GLOW_FILTER];
        } else this.intentIcon.filters = [];
    }
}