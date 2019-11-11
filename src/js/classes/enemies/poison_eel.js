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
        this.scaleModifier = 1.1;
        this.fitToTile();
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
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (!(x === 0 && y === 0)) {
                    const attackPositionX = this.tilePosition.x + x;
                    const attackPositionY = this.tilePosition.y + y;
                    if (Game.map[attackPositionY][attackPositionX].hazard === null) {
                        new PoisonHazard(attackPositionX, attackPositionY).addToWorld();
                    } else Game.map[attackPositionY][attackPositionX].hazard.refreshLifetime();
                    const player = getPlayerOnTile(attackPositionX, attackPositionY);
                    if (player) player.damage(this.atk);
                }
            }
        }
    }

    rotateByAngleMaximal(angle, rotateTime = this.FULL_ROTATE_TIME) {
        if (angle < 180 && angle > -180) {
            const sign = Math.sign(angle) !== 0 ? Math.sign(angle) : 1;
            angle = -sign * (360 - Math.abs(angle));
        }
        super.rotateByAngle(angle, rotateTime, this.cancellable);
    }
}