import {Game} from "../../../game";
import {Eel} from "./eel";
import {DAMAGE_TYPE, ENEMY_TYPE} from "../../../enums";
import {PoisonHazard} from "../../hazards/poison";
import {getPlayerOnTile} from "../../../map_checks";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";

export class PoisonEel extends Eel {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["eel_poison.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.type = ENEMY_TYPE.POISON_EEL;
        this.health = this.maxHealth = 4;
        this.atk = 1.25;
        this.triggered = false;
        this.FULL_ROTATE_TIME = 15;
        this.attackedLastTime = false;
        this.setScaleModifier(1.1);
    }

    move() {
        this.attackedLastTime = false;
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

    setStun(stun) {
        super.setStun(stun);
        this.triggered = false;
        this.angle = this.inMemoryAngle;
        this.cancelAnimation();
    }

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL) {
        const savedAngle = this.angle;
        super.damage(source, dmg, inputX, inputY, damageType);
        if (damageType !== DAMAGE_TYPE.HAZARDAL && !this.attackedLastTime && this.stun <= 0) {
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
                    const attackTile = {x: this.tilePosition.x + x, y: this.tilePosition.y + y};
                    Game.world.addHazard(new PoisonHazard(attackTile.x, attackTile.y));
                    const player = getPlayerOnTile(attackTile.x, attackTile.y);
                    if (player) player.damage(this.atk, this);
                }
            }
        }
        this.attackedLastTime = true;
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