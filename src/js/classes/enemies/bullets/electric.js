import {Bullet} from "./bullet";

export class ElectricBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, pattern, texture = Game.resources["src/images/bullets/electric_bullet.png"].texture) {
        super(texture, tilePositionX, tilePositionY, pattern);
    }

    attack(entity) {
        if (entity.electricityImmunity > 0) this.die();
        else super.attack(entity);
    }
}