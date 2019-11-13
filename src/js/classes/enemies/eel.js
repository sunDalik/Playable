import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {getPlayerOnTile, isRelativelyEmpty} from "../../mapChecks";

export class Eel extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/eel.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.atk = 1;
        this.turnDelay = 0;
        this.angle = 0;
        this.inMemoryAngle = this.angle;
        this.SLIDE_ANIMATION_TIME = 10;
        this.ROTATE_TIME = 6;
        this.wiggled = false;
        this.type = ENEMY_TYPE.EEL;
    }

    cancelAnimation() {
        super.cancelAnimation();
        this.angle = this.inMemoryAngle;
        this.wiggled = false;
    }

    move() {
        if (this.turnDelay === 0) {
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
            if (this.inMemoryAngle === 0) {
                this.swimToTile(0, -1);
            } else if (this.inMemoryAngle === 90) {
                this.swimToTile(1, 0);
            } else if (this.inMemoryAngle === 180) {
                this.swimToTile(0, 1)
            } else if (this.inMemoryAngle === 270) {
                this.swimToTile(-1, 0);
            }
            this.updateMapPosition();
            this.turnDelay = 1;
        } else this.turnDelay--;
    }

    swimToTile(tileStepX, tileStepY) {
        if (isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY)) {
            const player = getPlayerOnTile(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY);
            if (player) {
                player.damage(this.atk, this);
                this.slideBump(tileStepX, tileStepY);
            } else {
                this.slide(tileStepX, tileStepY, () => {
                    //fun fact: rotation applies after scaling!
                    if (this.animationCounter >= this.SLIDE_ANIMATION_TIME / 2 && !this.wiggled) {
                        this.scale.x *= -1;
                        this.wiggled = true;
                    }
                }, () => {
                    if (!isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY)) this.turnAround();
                    this.wiggled = false;
                });
            }
        } else this.turnAround();
    }

    damage(dmg, inputX = 0, inputY = 0, magical = false) {
        super.damage(dmg, inputX, inputY, magical);
        if (!this.dead) {
            if (inputX !== 0) {
                if (inputX > 0) {
                    this.rotateByAngleMinimal(270 - this.inMemoryAngle);
                    this.inMemoryAngle = 270;
                } else if (inputX < 0) {
                    this.rotateByAngleMinimal(90 - this.inMemoryAngle);
                    this.inMemoryAngle = 90;
                }
            } else if (inputY !== 0) {
                if (inputY > 0) {
                    this.rotateByAngleMinimal(0 - this.inMemoryAngle);
                    this.inMemoryAngle = 0;
                } else if (inputY < 0) {
                    this.rotateByAngleMinimal(180 - this.inMemoryAngle);
                    this.inMemoryAngle = 180;
                }
            } else {
                this.rotateByAngle(90);
                this.increaseAngle(90);
            }
        }
    }

    increaseAngle(angle) {
        this.inMemoryAngle += angle;
        if (this.inMemoryAngle < 0) this.inMemoryAngle = 360 - Math.abs(this.inMemoryAngle);
        if (this.inMemoryAngle >= 360) this.inMemoryAngle -= 360;
    }

    turnAround() {
        this.rotateByAngle(180);
        this.increaseAngle(180);
    }

    rotateByAngleMinimal(angle, rotateTime = this.ROTATE_TIME) {
        if (angle > 180) angle = angle - 360;
        super.rotateByAngle(angle, rotateTime);
    }
}