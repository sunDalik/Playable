import {Bullet} from "./bullet";
import {addHazardToWorld} from "../../../game_logic";
import {FireHazard} from "../../hazards/fire";

export class FireBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, pattern, texture = Game.resources["src/images/bullets/fire_bullet.png"].texture) {
        super(texture, tilePositionX, tilePositionY, pattern);
    }

    die() {
        super.die();
        addHazardToWorld(new FireHazard(this.tilePosition.x, this.tilePosition.y));
    }
}