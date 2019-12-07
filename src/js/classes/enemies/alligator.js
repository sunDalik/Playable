import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, RABBIT_TYPE} from "../../enums";
import {isEmpty} from "../../map_checks";
import {randomChoice} from "../../utils/random_utils";

export class Alligator extends Enemy {
    constructor(tilePositionX, tilePositionY, type = undefined, texture = Game.resources["src/images/enemies/alligator_x.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.ALLIGATOR;
        this.alligatorType = type;
        this.atk = 1;
        this.turnDelay = 2;
        this.currentTurnDelay = 0;
        this.prey = null;
        this.direction = {x: 1, y: 0};
        this.correctScale();
    }

    immediateReaction() {
        if (this.prey) {
            const shiftNegX = () => {
                const direction = {x: -Math.sign(Game.lastPlayerMoved.tilePosition.x - this.tilePosition.x), y: 0};
                return placePredator();
            };

            const shiftNegY = () => {
                const direction = {x: 0, y: -Math.sign(Game.lastPlayerMoved.tilePosition.y - this.tilePosition.y)};
                return placePredator();
            };

            const shiftPosX = () => {
                const direction = {x: Math.sign(Game.lastPlayerMoved.tilePosition.x - this.tilePosition.x), y: 0};
                return placePredator();
            };

            const shiftPosY = () => {
                const direction = {x: 0, y: Math.sign(Game.lastPlayerMoved.tilePosition.y - this.tilePosition.y)};
                return placePredator();
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
                    this.removeFromMap();
                    this.tilePosition.x += direction.x;
                    this.tilePosition.y += direction.y;
                    this.placeOnMap();
                    this.direction = direction;
                    return true;
                } else return false;
            };

            if (Math.random() < 0.5) {
                shiftNegX() || shiftNegY() || shiftPosX() || shiftNegY() || eat();
            } else {
                shiftNegY() || shiftNegX() || shiftPosY() || shiftNegX() || eat();
            }
        }
    }

    move() {
        if (this.prey && !this.prey.dead) {

            if (true) {
                this.prey = null;
            }
        } else if (this.currentTurnDelay === 0) {

            this.currentTurnDelay = this.turnDelay
        } else this.currentTurnDelay--;
    }

    correctScale() {
        if ((this.direction === 1 && this.scale.x < 0) || (this.direction === -1 && this.scale.x > 0)) {
            this.scale.x *= -1
        }
    }

    updateTexture() {

    }
}