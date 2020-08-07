import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums/enums";
import {IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {closestPlayer} from "../../../utils/game_utils";
import {HomingBullet} from "../bullets/homing";
import {getCardinalDirections} from "../../../utils/map_utils";
import {isEmpty} from "../../../map_checks";
import {Game} from "../../../game";
import {randomInt} from "../../../utils/random_utils";

export class HexEye extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["hex_eye.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 4;
        this.name = "Hex Eye";
        this.type = ENEMY_TYPE.HEX_EYE;
        this.aboutToCast = false;
        this.currentCooldown = 2;
        this.bullets = [];
        this.shadowInside = true;
    }

    move() {
        this.correctScale();
        if (this.controlling) {
            if (this.allBulletsDead()) {
                this.controlling = false;
                this.texture = RUEnemiesSpriteSheet["hex_eye.png"];
                this.currentCooldown = this.getCooldown();
            }
        } else if (this.aboutToCast) {
            this.aboutToCast = false;
            this.currentCooldown = this.getCooldown();
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

    getCooldown() {
        return randomInt(5, 7);
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.aboutToCast) {
            this.intentIcon.texture = IntentsSpriteSheet["magic.png"];
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

    allBulletsDead() {
        if (this.bullets.every(bullet => !bullet.homing || bullet.dead)) {
            this.bullets = [];
            return true;
        }
        return false;
    }
}