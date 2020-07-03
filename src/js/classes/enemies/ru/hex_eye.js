import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums";
import {IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {closestPlayer} from "../../../utils/game_utils";
import {HomingBullet} from "../bullets/homing";
import {getCardinalDirections} from "../../../utils/map_utils";
import {isEmpty} from "../../../map_checks";
import {Game} from "../../../game";

export class HexEye extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["hex_eye.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 4;
        this.type = ENEMY_TYPE.HEX_EYE;
        this.aboutToCast = false;
        this.cooldown = 5;
        this.currentCooldown = 2;
        this.bullets = [];
    }

    move() {
        this.correctScale();
        if (this.controlling) {
            if (this.bullets.every(bullet => !bullet.homing || bullet.dead)) {
                this.controlling = false;
                this.texture = RUEnemiesSpriteSheet["hex_eye.png"];
                this.currentCooldown = this.cooldown;
            }
        } else if (this.aboutToCast) {
            this.aboutToCast = false;
            this.currentCooldown = this.cooldown;
            this.createBullet();
            this.controlling = true;
        } else if (this.currentCooldown <= 0) {
            this.aboutToCast = true;
            this.texture = RUEnemiesSpriteSheet["hex_eye_center.png"];
        }
        this.currentCooldown--;
    }

    createBullet() {
        this.bullets = [];
        for (const dir of getCardinalDirections()) {
            if (isEmpty(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                const bullet = new HomingBullet(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
                Game.world.addBullet(bullet);
                this.bullets.push(bullet);
            }
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.casting) {
            this.intentIcon.texture = IntentsSpriteSheet["question_mark.png"];
        } else if (this.currentTurnDelay <= 0) {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        }
    }

    correctScale() {
        const sign = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
        if (sign !== 0) {
            this.scale.x = sign * Math.abs(this.scale.x);
        }
    }
}