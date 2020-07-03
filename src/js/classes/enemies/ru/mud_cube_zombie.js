import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums";
import {RUEnemiesSpriteSheet} from "../../../loader";
import {randomInt} from "../../../utils/random_utils";

export class MudCubeZombie extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["mud_cube_zombie.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 0.25;
        this.type = ENEMY_TYPE.MUD_CUBE_ZOMBIE;
        this.atk = 0;
        this.movable = false;
        this.currentLifeTime = this.lifeTime = randomInt(12, 16);
        this.fadingDestructionParticles = true;
        this.removeShadow();
    }

    move() {
        if (this.currentLifeTime <= 0) {
            this.die(null);
        } else {
            this.currentLifeTime--;
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.visible = false;
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
        if (this.healthContainer) {
            this.onMoveFrame();
        }
    }
}