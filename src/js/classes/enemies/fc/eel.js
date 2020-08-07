import {Game} from "../../../game"
import {Enemy} from "../enemy"
import {ENEMY_TYPE} from "../../../enums/enums";
import {getPlayerOnTile, isRelativelyEmpty} from "../../../map_checks";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {DAMAGE_TYPE} from "../../../enums/damage_type";

export class Eel extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["eel.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.name = "Eel";
        this.atk = 1;
        this.turnDelay = 1;
        this.angle = 0;
        this.inMemoryAngle = this.angle;
        this.SLIDE_ANIMATION_TIME = 10;
        this.ROTATE_TIME = 6;
        this.wiggled = false;
        this.type = ENEMY_TYPE.EEL;
        this.setCenterPreservation();
        this.removeShadow();
        this.setScaleModifier(0.85);
    }

    afterMapGen() {
        if (Math.random() < 0.5) {
            this.angle = 180;
            this.inMemoryAngle = 180;
        }
    }

    cancelAnimation() {
        super.cancelAnimation();
        this.angle = this.inMemoryAngle;
        this.wiggled = false;
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.inMemoryAngle === 0) {
                this.swimToTile(0, 1);
            } else if (this.inMemoryAngle === 90) {
                this.swimToTile(-1, 0);
            } else if (this.inMemoryAngle === 180) {
                this.swimToTile(0, -1)
            } else if (this.inMemoryAngle === 270) {
                this.swimToTile(1, 0);
            }
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

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        super.damage(source, dmg, inputX, inputY, damageType);
        if (!this.dead && !damageType.hazardal) {
            if (inputX !== 0) {
                if (inputX > 0) {
                    this.rotateByAngleMinimal(90 - this.inMemoryAngle);
                    this.inMemoryAngle = 90;
                } else if (inputX < 0) {
                    this.rotateByAngleMinimal(270 - this.inMemoryAngle);
                    this.inMemoryAngle = 270;
                }
            } else if (inputY !== 0) {
                if (inputY > 0) {
                    this.rotateByAngleMinimal(180 - this.inMemoryAngle);
                    this.inMemoryAngle = 180;
                } else if (inputY < 0) {
                    this.rotateByAngleMinimal(0 - this.inMemoryAngle);
                    this.inMemoryAngle = 0;
                }
            } else {
                this.rotateByAngle(90);
                this.increaseAngle(90);
            }
            if (this.turnDelay !== 0) {
                this.cancellable = false;
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

    setAngle(angle) {
        this.angle = angle;
        this.inMemoryAngle = angle;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.turnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
            this.intentIcon.angle = 0;
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["arrow_right.png"];
            this.intentIcon.angle = this.inMemoryAngle - 270;
        }
    }
}