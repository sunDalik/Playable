import {Bullet} from "./bullet";
import {FireHazard} from "../../hazards/fire";
import {Game} from "../../../game";
import {STAGE} from "../../../enums";

export class FireBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, pattern, texture = Game.resources["src/images/bullets/fire_bullet.png"].texture) {
        super(texture, tilePositionX, tilePositionY, pattern);
        if (Game.stage === STAGE.DARK_TUNNEL) {
            this.maskLayer = {};
        }
    }

    attack(entity) {
        //should fireImmunity affect taking damage from bullets? I am not sure
        if (entity.fireImmunity > 0) {
            this.die(false);
            this.dieFly(entity.tilePosition.x - this.tilePosition.x, entity.tilePosition.y - this.tilePosition.y);
        } else super.attack(entity);
    }

    die(toRemove = true) {
        super.die(toRemove);
        Game.world.addHazard(new FireHazard(this.tilePosition.x, this.tilePosition.y));
    }
}