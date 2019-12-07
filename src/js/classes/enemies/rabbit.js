import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, RABBIT_TYPE} from "../../enums";

export class Rabbit extends Enemy {
    constructor(tilePositionX, tilePositionY, type, texture = Game.resources["src/images/enemies/rabbit_x_energy.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 0.5;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.RABBIT;
        this.rabbitType = type;
        this.atk = 0.25;
        this.predator = null;
        this.stepXjumpHeight = Game.TILESIZE * 35 / 75;

        switch (this.rabbitType) {
            case RABBIT_TYPE.ENERGY:
                this.texture = Game.resources["src/images/enemies/rabbit_x_energy.png"].texture;
                break;
            case RABBIT_TYPE.ELECTRIC:
                this.texture = Game.resources["src/images/enemies/rabbit_x_electric.png"].texture;
                break;
            case RABBIT_TYPE.FIRE:
                this.texture = Game.resources["src/images/enemies/rabbit_x_fire.png"].texture;
                break;
            case RABBIT_TYPE.POISON:
                this.texture = Game.resources["src/images/enemies/rabbit_x_poison.png"].texture;
                break;
        }
    }

    move() {
        if (this.predator && !this.predator.dead) {
            return false;

        } else {
            this.predator = null;
        }
    }
}