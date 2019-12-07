import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, RABBIT_TYPE} from "../../enums";
import {getRelativelyEmptyCardinalDirections} from "../../utils/map_utils";
import {randomChoice} from "../../utils/random_utils";
import {getPlayerOnTile} from "../../map_checks";
import {addBulletToWorld, addHazardToWorld} from "../../game_logic";
import {FireHazard} from "../hazards/fire";
import {PoisonHazard} from "../hazards/poison";
import {ElectricBullet} from "./bullets/electric";

export class Rabbit extends Enemy {
    constructor(tilePositionX, tilePositionY, type, texture = Game.resources["src/images/enemies/rabbit_x_energy.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 0.5;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.RABBIT;
        this.rabbitType = type;
        this.atk = 0.25;
        this.predator = null;
        this.turnDelay = 1;
        this.currentTurnDelay = this.turnDelay;
        this.stepXjumpHeight = Game.TILESIZE * 35 / 75;
        if (this.rabbitType === RABBIT_TYPE.ENERGY) {
            this.energyDrop = 30;
        }
        this.updateTexture();
    }

    move() {
        if (this.predator && !this.predator.dead) {
            return false;
        } else if (this.currentTurnDelay <= 0) {
            this.predator = null;
            const movementOptions = getRelativelyEmptyCardinalDirections(this);
            if (movementOptions.length !== 0) {
                const moveDir = randomChoice(movementOptions);
                if (moveDir.x !== 0 && Math.sign(moveDir.x) !== Math.sign(this.scale.x)) {
                    this.scale.x *= -1;
                }
                const player = getPlayerOnTile(this.tilePosition.x + moveDir.x, this.tilePosition.y + moveDir.y);
                if (player) {
                    this.bump(moveDir.x, moveDir.y);
                    player.damage(this.atk, this, true);
                } else {
                    this.step(moveDir.x, moveDir.y);
                }
                this.currentTurnDelay = this.turnDelay;
            }
        } else this.currentTurnDelay--;
    }

    die(source, eaten = false) {
        super.die(source);
        if (!eaten) {
            if (this.rabbitType === RABBIT_TYPE.FIRE) {
                addHazardToWorld(new FireHazard(this.tilePosition.x, this.tilePosition.y));
            } else if (this.rabbitType === RABBIT_TYPE.POISON) {
                addHazardToWorld(new PoisonHazard(this.tilePosition.x, this.tilePosition.y, true));
                addHazardToWorld(new PoisonHazard(this.tilePosition.x + 1, this.tilePosition.y, true));
                addHazardToWorld(new PoisonHazard(this.tilePosition.x - 1, this.tilePosition.y, true));
                addHazardToWorld(new PoisonHazard(this.tilePosition.x, this.tilePosition.y + 1, true));
                addHazardToWorld(new PoisonHazard(this.tilePosition.x, this.tilePosition.y - 1, true));
            } else if (this.rabbitType === RABBIT_TYPE.ELECTRIC) {
                addBulletToWorld(new ElectricBullet(this.tilePosition.x + 1, this.tilePosition.y + 1,
                    [{x: 1, y: 1}]));
                addBulletToWorld(new ElectricBullet(this.tilePosition.x - 1, this.tilePosition.y + 1,
                    [{x: -1, y: 1}]));
                addBulletToWorld(new ElectricBullet(this.tilePosition.x + 1, this.tilePosition.y - 1,
                    [{x: 1, y: -1}]));
                addBulletToWorld(new ElectricBullet(this.tilePosition.x - 1, this.tilePosition.y - 1,
                    [{x: -1, y: -1}]));
            }
        }
    }

    updateTexture() {
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
}