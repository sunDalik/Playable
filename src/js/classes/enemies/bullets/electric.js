import {Bullet} from "./bullet";
import {STAGE} from "../../../enums";
import {Game} from "../../../game";

export class ElectricBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, pattern, texture = Game.resources["src/images/bullets/electric_bullet.png"].texture) {
        super(texture, tilePositionX, tilePositionY, pattern);
        if (Game.stage === STAGE.DARK_TUNNEL) {
            this.maskLayer = {};
        }
    }

    attack(entity) {
        if (entity.electricityImmunity > 0) {
            this.die(false);
            this.dieFly(entity.tilePosition.x - this.tilePosition.x, entity.tilePosition.y - this.tilePosition.y);
        } else super.attack(entity);
    }
}