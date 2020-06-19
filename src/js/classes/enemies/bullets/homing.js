import {Bullet} from "./bullet";
import {Game} from "../../../game";
import {ROLE, STAGE} from "../../../enums";
import {BulletsSpriteSheet} from "../../../loader";

export class HomingBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, pattern, texture = BulletsSpriteSheet["homing_bullet.png"]) {
        super(texture, tilePositionX, tilePositionY, pattern);
        if (Game.stage === STAGE.DARK_TUNNEL) {
            this.maskLayer = {};
        }
    }

    move() {

    }

    attack(entity) {
        if (entity.role === ROLE.ENEMY) {
            this.die(false);
            this.dieFly(entity.tilePosition.x - this.tilePosition.x, entity.tilePosition.y - this.tilePosition.y);
        } else super.attack(entity);
    }
}