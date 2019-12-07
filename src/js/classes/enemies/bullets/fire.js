import {Bullet} from "./bullet";
import {addHazardToWorld} from "../../../game_logic";
import {FireHazard} from "../../hazards/fire";
import {Game} from "../../../game";
import {STAGE} from "../../../enums";

export class FireBullet extends Bullet {
    constructor(tilePositionX, tilePositionY, pattern, texture = Game.resources["src/images/bullets/fire_bullet.png"].texture) {
        super(texture, tilePositionX, tilePositionY, pattern);
        if (Game.stage === STAGE.DARK_TUNNEL) {
            this.maskLayer = {};
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
        }
    }

    attack(entity) {
        if (entity.fireImmunity > 0) this.die();
        else super.attack(entity);
    }

    die() {
        super.die();
        addHazardToWorld(new FireHazard(this.tilePosition.x, this.tilePosition.y));
    }

    fly(tileStepX, tileStepY, animationTime = this.ANIMATION_TIME) {
        Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        super.fly(tileStepX, tileStepY, animationTime);
        Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
    }
}