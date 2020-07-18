import {ENEMY_TYPE} from "../../../enums/enums";
import {DTEnemiesSpriteSheet} from "../../../loader";
import {Snail} from "../fc/snail";
import {Game} from "../../../game";
import {FireHazard} from "../../hazards/fire";
import {FireBullet} from "../bullets/fire";

export class FireSnail extends Snail {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["fire_snail.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 4;
        this.type = ENEMY_TYPE.FIRE_SNAIL;
        this.atk = 1.5;
    }

    createHazard() {
        const newFire = new FireHazard(this.tilePosition.x, this.tilePosition.y);
        newFire.spreadTimes = 1;
        Game.world.addHazard(newFire);
    }

    die(source) {
        super.die(source);
        Game.world.addBullet(new FireBullet(this.tilePosition.x, this.tilePosition.y, [{x: 1, y: 0}]));
        Game.world.addBullet(new FireBullet(this.tilePosition.x, this.tilePosition.y, [{x: -1, y: 0}]));
        Game.world.addBullet(new FireBullet(this.tilePosition.x, this.tilePosition.y, [{x: 0, y: 1}]));
        Game.world.addBullet(new FireBullet(this.tilePosition.x, this.tilePosition.y, [{x: 0, y: -1}]));
    }
}