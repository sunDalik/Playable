import {Bullet} from "./bullet";
import {ROLE} from "../../../enums/enums";
import {BulletsSpriteSheet} from "../../../loader";

export class LunaticLeaderBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, pattern, texture = BulletsSpriteSheet["lunatic_leader_bullet.png"]) {
        super(texture, tilePositionX, tilePositionY, pattern);
        this.wiggling = true;
    }

    attack(entity) {
        if (entity.role === ROLE.ENEMY) {
            this.die(false);
            this.dieFly(entity.tilePosition.x - this.tilePosition.x, entity.tilePosition.y - this.tilePosition.y);
        } else super.attack(entity);
    }
}