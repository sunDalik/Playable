import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, RABBIT_TYPE, STAGE} from "../../enums";
import {getPlayerOnTile, isAnyWall, isEmpty, isNotAWall, isRelativelyEmpty} from "../../map_checks";
import {getChasingOptions, getRelativelyEmptyCardinalDirections} from "../../utils/map_utils";
import {randomChoice} from "../../utils/random_utils";
import {PoisonHazard} from "../hazards/poison";
import {ElectricBullet} from "./bullets/electric";
import {FireBullet} from "./bullets/fire";
import {closestPlayer, tileDistance} from "../../utils/game_utils";

export class Alligator extends Enemy {
    constructor(tilePositionX, tilePositionY, type = undefined, texture = Game.resources["src/images/enemies/alligator_x.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.ALLIGATOR;
        this.alligatorType = type;
        this.shooting = false;
        this.shootingDelay = false;
        this.atk = 1;
        if (this.alligatorType === RABBIT_TYPE.ELECTRIC || this.alligatorType === RABBIT_TYPE.FIRE || this.alligatorType === RABBIT_TYPE.POISON) {
            this.turnDelay = 1;
        } else this.turnDelay = 2;
        this.currentTurnDelay = 0;
        this.prey = null;
        this.triggeredDirection = null;
        this.direction = {x: 1, y: 0};
        this.stepXjumpHeight = Game.TILESIZE * 24 / 75;
        this.maxShootingTimes = 5;
        this.currentShootingTimes = 0;
        if (this.alligatorType === RABBIT_TYPE.ENERGY) {
            this.energyDrop = 40;
        }
        this.scaleModifier = 1.1;
        this.fitToTile();
        this.updateTexture();
        this.poisonCounter = 0;
    }

    fitToTile() {
        const scaleY = Game.TILESIZE / this.getUnscaledHeight() * this.scaleModifier;
        const scaleX = Math.abs(scaleY);
        this.scale.set(scaleX, scaleY);
    }

    immediateReaction() {
        this.lightItself();
        if (this.prey) {
            this.prey.visible = true;
            const shiftNegX = () => {
                const direction = {x: -Math.sign(Game.lastPlayerMoved.tilePosition.x - this.tilePosition.x), y: 0};
                return placePredator(direction);
            };

            const shiftNegY = () => {
                const direction = {x: 0, y: -Math.sign(Game.lastPlayerMoved.tilePosition.y - this.tilePosition.y)};
                return placePredator(direction);
            };

            const eat = () => {
                this.prey.die(this, true);
                if (this.prey.rabbitType !== undefined) {
                    this.alligatorType = this.prey.rabbitType;
                    if (this.alligatorType === RABBIT_TYPE.ENERGY) {
                        this.stepXjumpHeight = Game.TILESIZE * 60 / 75;
                        this.energyDrop = 40;
                    } else this.turnDelay = 1;
                    this.updateTexture();
                    this.lightItself();
                }
                this.prey = null;
            };

            const placePredator = (direction) => {
                if (isEmpty(this.tilePosition.x + direction.x, this.tilePosition.y + direction.y)) {
                    this.shiftTilePosition(direction.x, direction.y);
                    this.direction = {x: -direction.x, y: -direction.y};
                    this.updateTexture();
                    return true;
                } else return false;
            };

            if (Math.random() < 0.75) {
                shiftNegX() || shiftNegY() || eat();
            } else {
                shiftNegY() || shiftNegX() || eat();
            }
        }
    }

    move() {
        if (this.prey && !this.prey.dead) {
            if (isEmpty(this.prey.tilePosition.x + this.direction.x, this.prey.tilePosition.y + this.direction.y)) {
                this.prey.step(this.direction.x, this.direction.y);
                this.prey.cancellable = false;
                this.step(this.direction.x, this.direction.y);
            } else {
                this.prey.die(this, true);
                if (this.prey.rabbitType !== undefined) {
                    this.alligatorType = this.prey.rabbitType;
                    if (this.alligatorType === RABBIT_TYPE.ENERGY) {
                        this.stepXjumpHeight = Game.TILESIZE * 60 / 75;
                        this.energyDrop = 40;
                        this.step(this.direction.x, this.direction.y);
                        this.updateTexture();
                    } else {
                        this.turnDelay = 1;
                        this.shooting = true;
                        this.step(this.direction.x, this.direction.y, null, () => {
                            this.direction = {x: -this.direction.x, y: -this.direction.y};
                            this.updateTexture();
                            this.lightItself();
                            this.shake(this.direction.y, this.direction.x);
                        });
                    }
                } else this.step(this.direction.x, this.direction.y);
                this.prey = null;
            }
        } else if (this.shooting) {
            if (this.shootingDelay === true) {
                this.shootingDelay = false;
                this.shake(this.direction.y, this.direction.x);
            } else if (this.currentShootingTimes < this.maxShootingTimes) {
                const dirX = this.direction.x;
                const dirY = this.direction.y;
                switch (this.alligatorType) {
                    case undefined:
                        this.currentShootingTimes = this.maxShootingTimes;
                        break;
                    case RABBIT_TYPE.ELECTRIC:
                        if (dirX !== 0) {
                            Game.world.addBullet(new ElectricBullet(this.tilePosition.x + dirX, this.tilePosition.y,
                                [{x: dirX, y: 1}, {x: dirX, y: -1}]));
                            Game.world.addBullet(new ElectricBullet(this.tilePosition.x + dirX, this.tilePosition.y,
                                [{x: dirX, y: -1}, {x: dirX, y: 1}]));
                        } else if (dirY !== 0) {
                            Game.world.addBullet(new ElectricBullet(this.tilePosition.x, this.tilePosition.y + dirY,
                                [{x: 1, y: dirY}, {x: -1, y: dirY}]));
                            Game.world.addBullet(new ElectricBullet(this.tilePosition.x, this.tilePosition.y + dirY,
                                [{x: -1, y: dirY}, {x: 1, y: dirY}]));
                        }
                        break;
                    case RABBIT_TYPE.FIRE:
                        if (dirX !== 0) {
                            Game.world.addBullet(new FireBullet(this.tilePosition.x + dirX, this.tilePosition.y,
                                [{x: dirX, y: -1}]));
                            Game.world.addBullet(new FireBullet(this.tilePosition.x + dirX, this.tilePosition.y,
                                [{x: dirX, y: 1}]));
                        } else if (dirY !== 0) {
                            Game.world.addBullet(new FireBullet(this.tilePosition.x, this.tilePosition.y + dirY,
                                [{x: -1, y: dirY}]));
                            Game.world.addBullet(new FireBullet(this.tilePosition.x, this.tilePosition.y + dirY,
                                [{x: 1, y: dirY}]));
                        }
                        break;
                    case RABBIT_TYPE.POISON:
                        if (isNotAWall(this.tilePosition.x + this.direction.x * (this.poisonCounter * 2 + 1),
                            this.tilePosition.y + this.direction.y * (this.poisonCounter * 2 + 1))) {
                            Game.world.addHazard(new PoisonHazard(this.tilePosition.x + this.direction.x * (this.poisonCounter * 2 + 1),
                                this.tilePosition.y + this.direction.y * (this.poisonCounter * 2 + 1)));
                        }
                        if (isNotAWall(this.tilePosition.x + this.direction.x * (this.poisonCounter * 2 + 2),
                            this.tilePosition.y + this.direction.y * (this.poisonCounter * 2 + 2))) {
                            Game.world.addHazard(new PoisonHazard(this.tilePosition.x + this.direction.x * (this.poisonCounter * 2 + 2),
                                this.tilePosition.y + this.direction.y * (this.poisonCounter * 2 + 2)));
                        }
                        if (isAnyWall(this.tilePosition.x + this.direction.x * (this.poisonCounter * 2 + 3),
                            this.tilePosition.y + this.direction.y * (this.poisonCounter * 2 + 3))) {
                            this.currentShootingTimes = this.maxShootingTimes;
                        }
                        break;
                }

                this.currentShootingTimes++;
                this.poisonCounter++;
                if (this.currentShootingTimes < this.maxShootingTimes) {
                    this.shake(this.direction.y, this.direction.x);
                } else {
                    this.shooting = false;
                    this.updateTexture();
                }
            } else this.shooting = false;
        } else if (this.currentTurnDelay <= 0) {
            this.prey = null;
            let movementOptions = [];
            if (this.triggeredDirection) {
                if (isRelativelyEmpty(this.tilePosition.x + this.triggeredDirection.x, this.tilePosition.y + this.triggeredDirection.y)) {
                    movementOptions = [this.triggeredDirection];
                } else {
                    this.bump(this.triggeredDirection.x, this.triggeredDirection.y);
                    this.currentTurnDelay = this.turnDelay;
                }
            } else {
                if (this.alligatorType === RABBIT_TYPE.ENERGY) {
                    movementOptions = getRelativelyEmptyCardinalDirections(this, 2);
                    if (movementOptions.length === 0) movementOptions = getRelativelyEmptyCardinalDirections(this);
                } else {
                    if (tileDistance(this, closestPlayer(this)) <= 2) {
                        movementOptions = getChasingOptions(this, closestPlayer(this));
                        if (movementOptions.length === 0) movementOptions = getRelativelyEmptyCardinalDirections(this);
                    } else movementOptions = getRelativelyEmptyCardinalDirections(this);
                }
            }
            this.triggeredDirection = null;
            if (movementOptions.length !== 0) {
                this.direction = randomChoice(movementOptions);
                this.updateTexture();
                const player = getPlayerOnTile(this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y);
                if (player) {
                    this.bump(this.direction.x, this.direction.y);
                    player.damage(this.atk, this, true);
                } else {
                    this.step(this.direction.x, this.direction.y);
                }
                this.currentTurnDelay = this.turnDelay;
            }
        } else
            this.currentTurnDelay--;
    }

    damage(source, dmg, inputX = 0, inputY = 0, magical = false, hazardDamage = false) {
        super.damage(source, dmg, inputX, inputY, magical, hazardDamage);
        if (!this.dead) {
            if (!hazardDamage && !magical && (inputY !== 0 || inputX !== 0) && (!this.prey || this.prey.dead)) {
                this.triggeredDirection = {x: -inputX, y: -inputY};
                this.poisonCounter = 0;
                this.direction = this.triggeredDirection;
                this.updateTexture();
                if (this.alligatorType === RABBIT_TYPE.ENERGY) {
                    this.currentTurnDelay--;
                }
            }
            if (Math.random() < 0.3 && (this.alligatorType === RABBIT_TYPE.ELECTRIC || this.alligatorType === RABBIT_TYPE.FIRE || this.alligatorType === RABBIT_TYPE.POISON)) {
                if (!this.shooting) {
                    this.shooting = true;
                    this.shootingDelay = true;
                    this.currentShootingTimes = 0;
                    this.poisonCounter = 0;
                    this.updateTexture();
                    this.shake(this.direction.y, this.direction.x);
                }
            }
        }
    }

    updateTexture() {
        if (this.direction.x !== 0) {
            this.scale.y = Math.abs(this.scale.y);
            if (this.direction.x > 0) this.scale.x = Math.abs(this.scale.x);
            else if (this.direction.x < 0) this.scale.x = -Math.abs(this.scale.x);
            if (this.alligatorType === undefined && this.prey && !this.prey.dead) {
                this.texture = Game.resources["src/images/enemies/alligator_x_hungry.png"].texture;
                if (this.direction.x > 0) this.prey.scale.x = Math.abs(this.prey.scale.x);
                else if (this.direction.x < 0) this.prey.scale.x = -Math.abs(this.prey.scale.x);
            } else if (this.alligatorType === undefined) this.texture = Game.resources["src/images/enemies/alligator_x.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.ELECTRIC) {
                if (this.shooting) this.texture = Game.resources["src/images/enemies/alligator_x_electric_shooting.png"].texture;
                else this.texture = Game.resources["src/images/enemies/alligator_x_electric.png"].texture;
            } else if (this.alligatorType === RABBIT_TYPE.FIRE) {
                if (this.shooting) this.texture = Game.resources["src/images/enemies/alligator_x_fire_shooting.png"].texture;
                else this.texture = Game.resources["src/images/enemies/alligator_x_fire.png"].texture;
            } else if (this.alligatorType === RABBIT_TYPE.ENERGY) this.texture = Game.resources["src/images/enemies/alligator_x_energy.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.POISON) {
                if (this.shooting) this.texture = Game.resources["src/images/enemies/alligator_x_poison_shooting.png"].texture;
                else this.texture = Game.resources["src/images/enemies/alligator_x_poison.png"].texture;
            }
        } else if (this.direction.y !== 0) {
            this.scale.x = randomChoice([-1, 1]) * Math.abs(this.scale.x);
            if (this.direction.y > 0) this.scale.y = Math.abs(this.scale.y);
            else if (this.direction.y < 0) this.scale.y = -Math.abs(this.scale.y);
            if (this.alligatorType === undefined && this.prey && !this.prey.dead) this.texture = Game.resources["src/images/enemies/alligator_y_hungry.png"].texture;
            else if (this.alligatorType === undefined) this.texture = Game.resources["src/images/enemies/alligator_y.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.ELECTRIC) {
                if (this.shooting) this.texture = Game.resources["src/images/enemies/alligator_y_electric_shooting.png"].texture;
                else this.texture = Game.resources["src/images/enemies/alligator_y_electric.png"].texture;
            } else if (this.alligatorType === RABBIT_TYPE.FIRE) {
                if (this.shooting) this.texture = Game.resources["src/images/enemies/alligator_y_fire_shooting.png"].texture;
                else this.texture = Game.resources["src/images/enemies/alligator_y_fire.png"].texture;
            } else if (this.alligatorType === RABBIT_TYPE.ENERGY) this.texture = Game.resources["src/images/enemies/alligator_y_energy.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.POISON) {
                if (this.shooting) this.texture = Game.resources["src/images/enemies/alligator_y_poison_shooting.png"].texture;
                else this.texture = Game.resources["src/images/enemies/alligator_y_poison.png"].texture;
            }
        }
    }

    lightItself() {
        if (Game.stage === STAGE.DARK_TUNNEL) {
            if (this.alligatorType === RABBIT_TYPE.ELECTRIC || this.alligatorType === RABBIT_TYPE.FIRE) {
                this.maskLayer = {};
                Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
            }
        }
    }

    die(source) {
        super.die(source);
        this.prey = null;
    }
}