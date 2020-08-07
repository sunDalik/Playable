import {Bullet} from "./bullet";
import {FireHazard} from "../../hazards/fire";
import {Game} from "../../../game";
import {ROLE, STAGE} from "../../../enums/enums";
import {BulletsSpriteSheet} from "../../../loader";

export class FireBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, pattern, texture = BulletsSpriteSheet["fire_bullet.png"]) {
        super(texture, tilePositionX, tilePositionY, pattern);
        this.name = "Fire Bullet";
        if (Game.stage === STAGE.DARK_TUNNEL) {
            this.maskLayer = {};
        }
    }

    attack(entity) {
        if (entity.role === ROLE.ENEMY) {
            this.die(false);
            this.dieFly(entity.tilePosition.x - this.tilePosition.x, entity.tilePosition.y - this.tilePosition.y);
        } else super.attack(entity);
    }

    die(toRemove = true) {
        super.die(toRemove);
        Game.world.addHazard(new FireHazard(this.tilePosition.x, this.tilePosition.y));
    }
}