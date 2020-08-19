import {ENEMY_TYPE} from "../../../enums/enums";
import {Enemy} from "../enemy";
import {DCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {Z_INDEXES} from "../../../z_indexing";

export class DesertWorm extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["desert_worm.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 1;
        this.name = "Desert Worm";
        this.type = ENEMY_TYPE.DESERT_WORM;
        this.atk = 1;
        this.removeShadow();
        this.burrowed = true;
        this.setScaleModifier(1.21); // 312 / 256 = 1.21
        this.setOwnZIndex(Z_INDEXES.PLAYER - 1);
    }

    immediateReaction() {
        if (this.burrowed) this.removeFromMap();
    }

    placeOnMap() {
        if (!this.burrowed) {
            super.placeOnMap();
        }
    }

    move() {
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
    }
}