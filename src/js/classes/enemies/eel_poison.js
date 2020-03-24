import {Game} from "../../game"
import {Eel} from "./eel"
import {ENEMY_TYPE} from "../../enums";
import {PoisonHazard} from "../hazards/poison";
import {getPlayerOnTile} from "../../map_checks";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../loader";

export class PoisonEel extends Eel {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["eel_poison.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.atk = 1.25;
        this.triggered = false;
        this.FULL_ROTATE_TIME = 15;
        this.type = ENEMY_TYPE.POISON_EEL;
        this.scaleModifier = 1.1;
        this.fitToTile();
    }

    move() {
        if (this.triggered && this.turnDelay === 0) {
            this.attack();
            this.triggered = false;
            this.turnDelay = 0;
        } else if (this.triggered) {
            this.turnDelay--;
            this.cancelAnimation();
            if (this.inMemoryAngle === 0 || this.inMemoryAngle === 180) this.shake(1, 0);
            else this.shake(0, 1);
        } else super.move();
    }

    damage(source, dmg, inputX = 0, inputY = 0, magical = false, hazardDamage = false) {
        const savedAngle = this.angle;
        super.damage(source, dmg, inputX, inputY, magical, hazardDamage);
        if (!hazardDamage) {
            if (this.turnDelay === 0) {
                this.cancelAnimation();
                this.angle = savedAngle;
                this.cancellable = false;
            }
            this.triggered = true;
        }
    }

    attack() {
        this.rotateByAngleMaximal(this.inMemoryAngle - this.angle, this.FULL_ROTATE_TIME);
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (!(x === 0 && y === 0)) {
                    const attackPositionX = this.tilePosition.x + x;
                    const attackPositionY = this.tilePosition.y + y;
                    Game.world.addHazard(new PoisonHazard(attackPositionX, attackPositionY));
                    const player = getPlayerOnTile(attackPositionX, attackPositionY);
                    if (player) player.damage(this.atk, this);
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

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.triggered) {
            this.intentIcon.texture = IntentsSpriteSheet["poison.png"];
            this.intentIcon.angle = 0;
        }
    }
}