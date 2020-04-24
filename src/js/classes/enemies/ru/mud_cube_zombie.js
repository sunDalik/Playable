import {Game} from "../../../game"
import {Enemy} from "../enemy"
import {ENEMY_TYPE} from "../../../enums";
import {RUEnemiesSpriteSheet} from "../../../loader";

export class MudCubeZombie extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["mud_cube_zombie.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 0.25;
        this.type = ENEMY_TYPE.MUD_CUBE_ZOMBIE;
        this.atk = 0;
        this.movable = false;
        this.fadingDestructionParticles = true;
        this.energyDrop = 0;
        this.removeShadow();
    }

    move() {
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