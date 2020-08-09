import {Enemy} from "./enemy";
import {FCEnemiesSpriteSheet} from "../../loader";
import {ENEMY_TYPE} from "../../enums/enums";
import {DAMAGE_TYPE} from "../../enums/damage_type";

export class TrainingDummy extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["training_dummy.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 99;
        this.name = "Training Dummy";
        this.type = ENEMY_TYPE.TRAINING_DUMMY;
        this.atk = 0;
        this.movable = false;
        this.shadowHeight = 6;
        this.shadowInside = true;
        this.shadowWidthMul = 0.4;
        this.regenerateShadow();
        this.setScaleModifier(1.25);
    }

    redrawHealth() {
    }

    move() {
    }

    setStun(stun) {
    }

    setStunIcon() {
        this.intentIcon.visible = false;
    }

    updateIntentIcon() {
        this.intentIcon.visible = false;
    }

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        super.damage(source, dmg, inputX, inputY, damageType);
        this.healthContainer.visible = false;
        this.health = 99;
    }
}