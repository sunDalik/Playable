import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, RABBIT_TYPE} from "../../enums";
import {getRelativelyEmptyDirections, getRelativelyEmptyCardinalDirections} from "../../utils/map_utils";
import {randomChoice} from "../../utils/random_utils";
import {getPlayerOnTile, isAnyWall, isInanimate} from "../../map_checks";
import {FireHazard} from "../hazards/fire";
import {PoisonHazard} from "../hazards/poison";
import {ElectricBullet} from "./bullets/electric";
import {closestPlayer} from "../../utils/game_utils";

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
        this.stepXjumpHeight = Game.TILESIZE * 70 / 75;
        if (this.rabbitType === RABBIT_TYPE.ENERGY) {
            this.energyDrop = 30;
        }
        this.updateTexture();
    }

    afterMapGen() {
        if (isAnyWall(this.tilePosition.x + 1, this.tilePosition.y)
            || isInanimate(this.tilePosition.x + 1, this.tilePosition.y)) {
            this.scale.x *= -1;
        }
    }

    move() {
        if (this.predator && !this.predator.dead) {
            return false;
        } else if (this.rabbitType === RABBIT_TYPE.ENERGY) {
            const threat = closestPlayer(this);
            let directions = [];
            if (Math.abs(threat.tilePosition.x - this.tilePosition.x) === 0) {
                directions.push({x: -1, y: 0});
                directions.push({x: 1, y: 0});
            } else directions.push({x: Math.sign(this.tilePosition.x - threat.tilePosition.x), y: 0});
            if (Math.abs(threat.tilePosition.y - this.tilePosition.y) === 0) {
                directions.push({x: 0, y: -1});
                directions.push({x: 0, y: 1});
            } else directions.push({x: 0, y: Math.sign(this.tilePosition.y - threat.tilePosition.y)});
            directions = getRelativelyEmptyDirections(this, directions);
            if (directions.length !== 0) {
                const moveDir = randomChoice(directions);
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
            } else this.bump(Math.sign(this.tilePosition.x - threat.tilePosition.x), Math.sign(this.tilePosition.y - threat.tilePosition.y));
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
                Game.world.addHazard(new FireHazard(this.tilePosition.x, this.tilePosition.y));
            } else if (this.rabbitType === RABBIT_TYPE.POISON) {
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y, true));
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x + 1, this.tilePosition.y, true));
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x - 1, this.tilePosition.y, true));
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y + 1, true));
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x, this.tilePosition.y - 1, true));
            } else if (this.rabbitType === RABBIT_TYPE.ELECTRIC) {
                Game.world.addBullet(new ElectricBullet(this.tilePosition.x, this.tilePosition.y, [{x: 1, y: 1}]));
                Game.world.addBullet(new ElectricBullet(this.tilePosition.x, this.tilePosition.y, [{x: -1, y: 1}]));
                Game.world.addBullet(new ElectricBullet(this.tilePosition.x, this.tilePosition.y, [{x: 1, y: -1}]));
                Game.world.addBullet(new ElectricBullet(this.tilePosition.x, this.tilePosition.y, [{x: -1, y: -1}]));
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