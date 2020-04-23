import {Game} from "../../../game"
import {Enemy} from "../enemy"
import {ENEMY_TYPE, RABBIT_TYPE, ROLE, STAGE} from "../../../enums";
import {getPlayerOnTile, isAnyWall, isEmpty, isNotAWall, isRelativelyEmpty} from "../../../map_checks";
import {
    getChasingOptions,
    getRelativelyEmptyCardinalDirections,
    getRelativelyEmptyLitCardinalDirections
} from "../../../utils/map_utils";
import {getRandomValue, randomChoice} from "../../../utils/random_utils";
import {PoisonHazard} from "../../hazards/poison";
import {ElectricBullet} from "../bullets/electric";
import {FireBullet} from "../bullets/fire";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {DTEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {Rabbit} from "./rabbit";

export class Alligator extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["alligator_x.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.ALLIGATOR;
        this.prey = null;
        this.initAlligator();
        this.shooting = false;
        this.shootingDelay = false;
        this.atk = 1;
        if (this.alligatorType === RABBIT_TYPE.ELECTRIC || this.alligatorType === RABBIT_TYPE.FIRE || this.alligatorType === RABBIT_TYPE.POISON) {
            this.turnDelay = 1;
        } else this.turnDelay = 2;
        this.currentTurnDelay = 0;
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

    initAlligator() {
        if (Math.random() < 0.3) {
            let type = getRandomValue(RABBIT_TYPE);
            if (type === RABBIT_TYPE.ENERGY) {
                //energy type is rarer than others so if we get it we reroll it once again
                type = getRandomValue(RABBIT_TYPE)
            }
            const rabbit = new Rabbit(this.tilePosition.x, this.tilePosition.y);
            rabbit.rabbitType = type;
            rabbit.updateTexture();
            rabbit.predator = this;
            this.prey = rabbit;
        } else {
            this.alligatorType = randomChoice([RABBIT_TYPE.FIRE, RABBIT_TYPE.ELECTRIC, RABBIT_TYPE.POISON]);
        }
    }

    onMoveFrame() {
        super.onMoveFrame();
        if (this.direction && this.direction.y === -1) this.healthContainer.position.y += Game.TILESIZE; // I have no idea why
    }

    afterMapGen() {
        if (this.prey) {
            Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = this.prey;
            Game.enemies.push(this.prey);
            Game.world.addChild(this.prey);
            this.prey.visible = false;
            this.prey.place();
        }
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
                        const x1 = this.tilePosition.x + this.direction.x * (this.poisonCounter * 2 + 1);
                        const y1 = this.tilePosition.y + this.direction.y * (this.poisonCounter * 2 + 1);
                        if (isNotAWall(x1, y1)) {
                            Game.world.addHazard(new PoisonHazard(x1, y1));
                            const player = getPlayerOnTile(x1, y1);
                            if (player) player.damage(this.atk, this, false, true);
                        } else this.currentShootingTimes = this.maxShootingTimes;

                        const x2 = this.tilePosition.x + this.direction.x * (this.poisonCounter * 2 + 2);
                        const y2 = this.tilePosition.y + this.direction.y * (this.poisonCounter * 2 + 2);
                        if (isNotAWall(x2, y2)) {
                            Game.world.addHazard(new PoisonHazard(x2, y2));
                            const player = getPlayerOnTile(x2, y2);
                            if (player) player.damage(this.atk, this, false, true);
                        } else this.currentShootingTimes = this.maxShootingTimes;

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
                        if (movementOptions.length === 0) movementOptions = getRelativelyEmptyLitCardinalDirections(this);
                    } else movementOptions = getRelativelyEmptyLitCardinalDirections(this);
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
            if (!hazardDamage && (inputY !== 0 || inputX !== 0) && (!this.prey || this.prey.dead)) {
                this.triggeredDirection = {x: -inputX, y: -inputY};
                if (this.direction.x !== this.triggeredDirection.x || this.direction.y !== this.triggeredDirection.y) this.poisonCounter = 0;
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
                this.texture = DTEnemiesSpriteSheet["alligator_x_hungry.png"];
                if (this.direction.x > 0) this.prey.scale.x = Math.abs(this.prey.scale.x);
                else if (this.direction.x < 0) this.prey.scale.x = -Math.abs(this.prey.scale.x);
            } else if (this.alligatorType === undefined) this.texture = DTEnemiesSpriteSheet["alligator_x.png"];
            else if (this.alligatorType === RABBIT_TYPE.ELECTRIC) {
                if (this.shooting) this.texture = DTEnemiesSpriteSheet["alligator_x_electric_shooting.png"];
                else this.texture = DTEnemiesSpriteSheet["alligator_x_electric.png"];
            } else if (this.alligatorType === RABBIT_TYPE.FIRE) {
                if (this.shooting) this.texture = DTEnemiesSpriteSheet["alligator_x_fire_shooting.png"];
                else this.texture = DTEnemiesSpriteSheet["alligator_x_fire.png"];
            } else if (this.alligatorType === RABBIT_TYPE.ENERGY) this.texture = DTEnemiesSpriteSheet["alligator_x_energy.png"];
            else if (this.alligatorType === RABBIT_TYPE.POISON) {
                if (this.shooting) this.texture = DTEnemiesSpriteSheet["alligator_x_poison_shooting.png"];
                else this.texture = DTEnemiesSpriteSheet["alligator_x_poison.png"];
            }
            this.removeCenterPreservation();
            this.setShadow();
        } else if (this.direction.y !== 0) {
            this.scale.x = randomChoice([-1, 1]) * Math.abs(this.scale.x);
            if (this.direction.y > 0) this.scale.y = Math.abs(this.scale.y);
            else if (this.direction.y < 0) this.scale.y = -Math.abs(this.scale.y);
            if (this.alligatorType === undefined && this.prey && !this.prey.dead) this.texture = DTEnemiesSpriteSheet["alligator_y_hungry.png"];
            else if (this.alligatorType === undefined) this.texture = DTEnemiesSpriteSheet["alligator_y.png"];
            else if (this.alligatorType === RABBIT_TYPE.ELECTRIC) {
                if (this.shooting) this.texture = DTEnemiesSpriteSheet["alligator_y_electric_shooting.png"];
                else this.texture = DTEnemiesSpriteSheet["alligator_y_electric.png"];
            } else if (this.alligatorType === RABBIT_TYPE.FIRE) {
                if (this.shooting) this.texture = DTEnemiesSpriteSheet["alligator_y_fire_shooting.png"];
                else this.texture = DTEnemiesSpriteSheet["alligator_y_fire.png"];
            } else if (this.alligatorType === RABBIT_TYPE.ENERGY) this.texture = DTEnemiesSpriteSheet["alligator_y_energy.png"];
            else if (this.alligatorType === RABBIT_TYPE.POISON) {
                if (this.shooting) this.texture = DTEnemiesSpriteSheet["alligator_y_poison_shooting.png"];
                else this.texture = DTEnemiesSpriteSheet["alligator_y_poison.png"];
            }
            this.setCenterPreservation();
            this.removeShadow();
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

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.angle = 0;
        if (this.shooting) {
            switch (this.alligatorType) {
                case RABBIT_TYPE.ELECTRIC:
                    this.intentIcon.texture = IntentsSpriteSheet["electricity.png"];
                    break;
                case RABBIT_TYPE.FIRE:
                    this.intentIcon.texture = IntentsSpriteSheet["fire.png"];
                    break;
                case RABBIT_TYPE.POISON:
                    this.intentIcon.texture = IntentsSpriteSheet["poison.png"];
                    break;
            }
        } else if (this.alligatorType === undefined && this.prey && !this.prey.dead) {
            this.intentIcon.texture = IntentsSpriteSheet["arrow_right.png"];
            this.intentIcon.angle = this.getArrowRightAngleForDirection(this.direction);
        } else if (this.currentTurnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else if (this.triggeredDirection) {
            this.intentIcon.texture = IntentsSpriteSheet["arrow_right.png"];
            this.intentIcon.angle = this.getArrowRightAngleForDirection(this.triggeredDirection);
        } else if (tileDistance(this, closestPlayer(this)) <= 2 && this.alligatorType !== RABBIT_TYPE.ENERGY) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else if (this.alligatorType === RABBIT_TYPE.ENERGY) {
            this.intentIcon.texture = IntentsSpriteSheet["question_mark.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }
}