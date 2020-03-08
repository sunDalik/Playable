import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";

export class MudCubeZombie extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/mud_cube_zombie.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 0.25;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.MUD_CUBE_ZOMBIE;
        this.atk = 0;
        this.movable = false;
        this.fadingDestructionParticles = true;
        this.energyDrop = 0;
    }

    move() {
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.visible = false;
    }
}