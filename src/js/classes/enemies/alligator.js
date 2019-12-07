import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, RABBIT_TYPE} from "../../enums";
import {getPlayerOnTile, isEmpty} from "../../map_checks";
import {getRelativelyEmptyCardinalDirections} from "../../utils/map_utils";
import {randomChoice} from "../../utils/random_utils";

export class Alligator extends Enemy {
    constructor(tilePositionX, tilePositionY, type = undefined, texture = Game.resources["src/images/enemies/alligator_x.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.ALLIGATOR;
        this.alligatorType = type;
        this.shooting = false;
        this.atk = 1;
        this.turnDelay = 1;
        this.currentTurnDelay = 0;
        this.prey = null;
        this.direction = {x: 1, y: 0};
        this.stepXjumpHeight = Game.TILESIZE * 12 / 75;
        this.scaleModifier = 1.1;
        this.fitToTile();
    }

    fitToTile() {
        const scaleY = Game.TILESIZE / this.getUnscaledHeight() * this.scaleModifier;
        const scaleX = Math.abs(scaleY);
        this.scale.set(scaleX, scaleY);
    }

    immediateReaction() {
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
            } else {
                this.prey.die(this);
                if (this.prey.rabbitType) {
                    this.alligatorType = this.prey.rabbitType;
                    this.updateTexture();
                }
                this.prey = null;
            }
            this.step(this.direction.x, this.direction.y);
        } else if (this.currentTurnDelay === 0) {
            const movementOptions = getRelativelyEmptyCardinalDirections(this);
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
        } else this.currentTurnDelay--;
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
            else if (this.alligatorType === RABBIT_TYPE.ELECTRIC) this.texture = Game.resources["src/images/enemies/alligator_x_electric.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.FIRE) this.texture = Game.resources["src/images/enemies/alligator_x_fire.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.ENERGY) this.texture = Game.resources["src/images/enemies/alligator_x_energy.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.POISON) this.texture = Game.resources["src/images/enemies/alligator_x_poison.png"].texture;
        } else if (this.direction.y !== 0) {
            this.scale.x = randomChoice([-1, 1]) * Math.abs(this.scale.x);
            if (this.direction.y > 0) this.scale.y = Math.abs(this.scale.y);
            else if (this.direction.y < 0) this.scale.y = -Math.abs(this.scale.y);
            if (this.alligatorType === undefined && this.prey && !this.prey.dead) this.texture = Game.resources["src/images/enemies/alligator_y_hungry.png"].texture;
            else if (this.alligatorType === undefined) this.texture = Game.resources["src/images/enemies/alligator_y.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.ELECTRIC) this.texture = Game.resources["src/images/enemies/alligator_y_electric.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.FIRE) this.texture = Game.resources["src/images/enemies/alligator_y_fire.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.ENERGY) this.texture = Game.resources["src/images/enemies/alligator_y_energy.png"].texture;
            else if (this.alligatorType === RABBIT_TYPE.POISON) this.texture = Game.resources["src/images/enemies/alligator_y_poison.png"].texture;
        }
    }
}