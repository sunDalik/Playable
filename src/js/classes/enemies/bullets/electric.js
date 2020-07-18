import {Bullet} from "./bullet";
import {ROLE, STAGE} from "../../../enums/enums";
import {Game} from "../../../game";
import {BulletsSpriteSheet} from "../../../loader";

export class ElectricBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, pattern, texture = BulletsSpriteSheet["electric_bullet.png"]) {
        super(texture, tilePositionX, tilePositionY, pattern);
        if (Game.stage === STAGE.DARK_TUNNEL) {
            this.maskLayer = {};
        }
    }

    getBulletAngle(future = false) {
        return this.angle
    }

    attack(entity) {
        if (entity.electricityImmunity > 0) {
            if (entity.role === ROLE.PLAYER) {
                this.atk /= 2;
                super.attack(entity);
            } else {
                this.die(false);
                this.dieFly(entity.tilePosition.x - this.tilePosition.x, entity.tilePosition.y - this.tilePosition.y);
            }
        } else super.attack(entity);
    }
}