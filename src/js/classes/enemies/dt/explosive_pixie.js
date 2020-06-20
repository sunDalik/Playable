import {Enemy} from "../enemy";
import {DAMAGE_TYPE, ENEMY_TYPE} from "../../../enums";
import {DTEnemiesSpriteSheet} from "../../../loader";

export class ExplosivePixie extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["explosive_pixie.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 0.25;
        this.type = ENEMY_TYPE.EXPLOSIVE_PIXIE;
    }

    move() {

    }

    damage(source, dmg, inputX, inputY, damageType = DAMAGE_TYPE.PHYSICAL) {
        super.damage(source, dmg, inputX, inputY, damageType);
    }


    updateIntentIcon() {
        super.updateIntentIcon();
    }
}