import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, RABBIT_TYPE, STAGE} from "../../enums";
import {getPlayerOnTile, isAnyWall, isEmpty, isNotAWall} from "../../map_checks";
import {getRelativelyEmptyCardinalDirections} from "../../utils/map_utils";
import {randomChoice} from "../../utils/random_utils";
import {addHazardToWorld} from "../../game_logic";
import {PoisonHazard} from "../hazards/poison";

export class Alligator extends Enemy {
    constructor(tilePositionX, tilePositionY, type = undefined, texture = Game.resources["src/images/enemies/alligator_x.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.ALLIGATOR;
        this.alligatorType = type;
        this.shooting = false;
        this.atk = 1;
        this.turnDelay = 2;
        this.currentTurnDelay = 0;
        this.prey = null;
        this.triggeredDirection = null;
        this.direction = {x: 1, y: 0};
        this.stepXjumpHeight = Game.TILESIZE * 12 / 75;
        this.scaleModifier = 1.1;
        this.maxShootingTimes = 5;
        this.currentShootingTimes = 0;
        if (this.alligatorType === RABBIT_TYPE.ENERGY) {
            this.energyDrop = 40;
        }
        this.fitToTile();
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
                if (this.prey.rabbitType) {
                    this.alligatorType = this.prey.rabbitType;
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
                this.prey.die(this);
                if (this.prey.rabbitType !== undefined) {
                    this.alligatorType = this.prey.rabbitType;
                    this.lightItself();
                    if (this.alligatorType === RABBIT_TYPE.ENERGY) {
                        this.energyDrop = 40;
                        this.step(this.direction.x, this.direction.y);
                        this.updateTexture();
                    } else {
                        this.turnDelay = 1;
                        this.shooting = true;
                        this.step(this.direction.x, this.direction.y, null, () => {
                            this.direction = {x: -this.direction.x, y: -this.direction.y};
                            this.updateTexture();
                            this.shake(this.direction.y, this.direction.x);
                        });
                    }
                } else this.step(this.direction.x, this.direction.y);
                this.prey = null;
            }
        } else if (this.shooting) {
            if (this.currentShootingTimes <= this.maxShootingTimes) {
                switch (this.alligatorType) {
                    case undefined:
                        this.currentShootingTimes = this.maxShootingTimes;
                        break;
                    case RABBIT_TYPE.ELECTRIC:

                        break;
                    case RABBIT_TYPE.FIRE:

                        break;
                    case RABBIT_TYPE.POISON:
                        if (isNotAWall(this.tilePosition.x + this.direction.x * (this.currentShootingTimes * 2 + 1),
                            this.tilePosition.y + this.direction.y * (this.currentShootingTimes * 2 + 1))) {
                            addHazardToWorld(new PoisonHazard(this.tilePosition.x + this.direction.x * (this.currentShootingTimes * 2 + 1),
                                this.tilePosition.y + this.direction.y * (this.currentShootingTimes * 2 + 1)));
                        }
                        if (isNotAWall(this.tilePosition.x + this.direction.x * (this.currentShootingTimes * 2 + 2),
                            this.tilePosition.y + this.direction.y * (this.currentShootingTimes * 2 + 2))) {
                            addHazardToWorld(new PoisonHazard(this.tilePosition.x + this.direction.x * (this.currentShootingTimes * 2 + 2),
                                this.tilePosition.y + this.direction.y * (this.currentShootingTimes * 2 + 2)));
                        }
                        if (isAnyWall(this.tilePosition.x + this.direction.x * (this.currentShootingTimes * 2 + 3),
                            this.tilePosition.y + this.direction.y * (this.currentShootingTimes * 2 + 3))) {
                            this.currentShootingTimes = this.maxShootingTimes;
                        }
                        break;
                }

                this.currentShootingTimes++;
                if (this.currentShootingTimes <= this.maxShootingTimes) {
                    this.shake(this.direction.y, this.direction.x);
                } else {
                    this.shooting = false;
                    this.updateTexture();
                }
            }
        } else if (this.currentTurnDelay === 0) {
            let movementOptions;
            if (this.triggeredDirection) movementOptions = [this.triggeredDirection];
            else movementOptions = getRelativelyEmptyCardinalDirections(this);
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
                this.direction = this.triggeredDirection;
                this.updateTexture();
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
}