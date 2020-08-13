import {ENEMY_TYPE} from "../../../enums/enums";
import {DTEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {MageEnemy} from "../mage_enemy";
import {Game} from "../../../game";
import {randomChoice} from "../../../utils/random_utils";
import {ElectricBullet} from "../bullets/electric";
import {FireBullet} from "../bullets/fire";
import {removeObjectFromArray} from "../../../utils/basic_utils";
import {closestPlayer, getAngleForDirection, otherPlayer} from "../../../utils/game_utils";
import {isLit, isNotAWall} from "../../../map_checks";

export class LostMage extends MageEnemy {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["lost_mage.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.name = "Lost Mage";
        this.type = ENEMY_TYPE.LOST_MAGE;
        this.bulletType = randomChoice([ElectricBullet, FireBullet]);
        this.intentIcon2 = this.createIntentIcon();
        this.intentIcon2.alpha = 0.8;
        this.intentIcon2.width = this.intentIcon2.height = 15;
        this.cooldown = 8;
        this.currentCooldown = 2;
        this.bulletQueue = [];
        this.triggeredDirection = {x: 1, y: 0};

        this.neutralTexture = texture;
        this.preparingTexture = DTEnemiesSpriteSheet["lost_mage_prepare.png"];
        this.castingTexture = DTEnemiesSpriteSheet["lost_mage_cast.png"];
    }

    almostCast() {
        /*
        this.maskLayer = {};
        if (Game.stage === STAGE.DARK_TUNNEL) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
        }
         */
    }

    setStun(stun) {
        super.setStun(stun);
        this.bulletQueue = [];
    }

    move() {
        this.advanceQueue();
        super.move();
    }

    cast() {
        this.bulletQueue = [];
        for (let i = 0; i < 4; i++) {
            const bullet = new this.bulletType(this.tilePosition.x + this.triggeredDirection.x, this.tilePosition.y + this.triggeredDirection.y,
                [{x: this.triggeredDirection.x, y: this.triggeredDirection.y}]);
            this.bulletQueue.push(bullet);
        }
        this.advanceQueue();

        this.alternateBulletType();
        /*
        if (Game.stage === STAGE.DARK_TUNNEL && this.maskLayer) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        }
        this.maskLayer = undefined;
         */
    }

    canCast() {
        if (!isLit(this.tilePosition.x, this.tilePosition.y)) return false;
        const dir = this.getTriggeredDirection();
        if (dir !== null) {
            this.triggeredDirection = dir;
            return true;
        }
        return false;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon2.visible = false;
        if (this.casting && this.currentCastTime === 1) {
            this.intentIcon2.visible = true;
            this.intentIcon2.texture = IntentsSpriteSheet["arrow_right.png"];
            this.intentIcon2.angle = getAngleForDirection(this.triggeredDirection);
            this.intentIcon2.zIndex = this.intentIcon.zIndex + 1;
            if (this.bulletType === FireBullet) this.intentIcon.texture = IntentsSpriteSheet["fire.png"];
            else this.intentIcon.texture = IntentsSpriteSheet["electricity.png"];
        }
    }

    alternateBulletType() {
        if (this.bulletType === ElectricBullet) {
            this.bulletType = FireBullet;
        } else {
            this.bulletType = ElectricBullet;
        }
    }

    advanceQueue() {
        if (this.bulletQueue.length > 0) {
            const bullet = this.bulletQueue[0];
            bullet.delay = 1;
            Game.world.addBullet(bullet);
            removeObjectFromArray(bullet, this.bulletQueue);
        }
    }

    getTriggeredDirection() {
        const players = [closestPlayer(this)];
        if (!otherPlayer(players[0]).dead) {
            players.push(otherPlayer(players[0]));
        }

        const directions = [];
        for (const player of players) {
            if (player.tilePosition.x === this.tilePosition.x) {
                directions.push({x: 0, y: Math.sign(player.tilePosition.y - this.tilePosition.y)});
            } else if (player.tilePosition.y === this.tilePosition.y) {
                directions.push({x: Math.sign(player.tilePosition.x - this.tilePosition.x), y: 0});
            } else {
                const xDiff = Math.abs(player.tilePosition.x - this.tilePosition.x);
                const yDiff = Math.abs(player.tilePosition.y - this.tilePosition.y);
                if (xDiff >= yDiff) {
                    directions.push({x: Math.sign(player.tilePosition.x - this.tilePosition.x), y: 0});
                } else {
                    directions.push({x: 0, y: Math.sign(player.tilePosition.y - this.tilePosition.y)});
                }
            }
        }

        const noWallDirections = [];
        for (const dir of directions) {
            if (isNotAWall(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                noWallDirections.push(dir);
            }
        }
        if (noWallDirections.length === 0) return null;
        else return noWallDirections[0];
    }
}