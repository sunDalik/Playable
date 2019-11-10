"use strict";

class PoisonEel extends Eel {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = Game.resources["src/images/enemies/eel_poison.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.atk = 1.25;
        this.damaged = false;
        this.triggered = false;
        this.FULL_ROTATE_TIME = 15;
        this.entityType = ENEMY_TYPE.POISON_EEL;
    }

    fitToTile() {
        const scaleX = Game.TILESIZE / this.getUnscaledWidth() * 1.1;
        const scaleY = Math.abs(scaleX);
        this.scale.set(scaleX, scaleY);
    }

    move() {
        if (this.triggered && this.turnDelay === 0) {
            this.attack();
            this.cancellable = true;
            this.triggered = false;
            this.turnDelay = 0;
        } else if (this.triggered) {
            this.turnDelay--;
            if (this.inMemoryAngle === 0 || this.inMemoryAngle === 180) this.shake(1, 0);
            else this.shake(0, 1);
        } else super.move();
    }

    damage(dmg, inputX = 0, inputY = 0, magical = false) {
        super.damage(dmg, inputX, inputY, magical);
        if (this.turnDelay === 0) {
            this.cancellable = false;
            Game.APP.ticker.remove(this.animation);
        }
        this.triggered = true;
    }

    attack() {
        this.rotateByAngleMaximal(this.inMemoryAngle - this.angle, this.FULL_ROTATE_TIME, this.cancellable);
    }

    rotateByAngleMaximal(angle, rotateTime = this.FULL_ROTATE_TIME) {
        if (angle < 180 && angle > -180) {
            const sign = Math.sign(angle) !== 0 ? Math.sign(angle) : 1;
            angle = -sign * (360 - Math.abs(angle));
        }
        super.rotateByAngle(angle, rotateTime, this.cancellable);
    }
}