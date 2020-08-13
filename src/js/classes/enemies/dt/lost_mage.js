import {ENEMY_TYPE, STAGE} from "../../../enums/enums";
import {DTEnemiesSpriteSheet} from "../../../loader";
import {MageEnemy} from "../mage_enemy";
import {Game} from "../../../game";
import {randomChoice} from "../../../utils/random_utils";
import {ElectricBullet} from "../bullets/electric";
import {FireBullet} from "../bullets/fire";
import {getCardinalDirections} from "../../../utils/map_utils";
import {removeObjectFromArray} from "../../../utils/basic_utils";

export class LostMage extends MageEnemy {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["lost_mage.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.name = "Lost Mage";
        this.type = ENEMY_TYPE.LOST_MAGE;
        this.bulletType = randomChoice([ElectricBullet, FireBullet]);
        this.intentIcon2 = this.createIntentIcon();
        this.cooldown = 10;
        this.currentCooldown = 2;
        this.bulletQueue = [];

        this.neutralTexture = texture;
        this.preparingTexture = DTEnemiesSpriteSheet["lost_mage_prepare.png"];
        this.castingTexture = DTEnemiesSpriteSheet["lost_mage_cast.png"];
    }

    almostCast() {
        //this.triggeredDirection =
        this.maskLayer = {};
        if (Game.stage === STAGE.DARK_TUNNEL) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
        }
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
        const dir = randomChoice(getCardinalDirections());
        for (let i = 0; i < 4; i++) {
            const bullet = new this.bulletType(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y,
                [{x: dir.x, y: dir.y}]);
            this.bulletQueue.push(bullet);
        }
        this.advanceQueue();

        this.alternateBulletType();
        if (Game.stage === STAGE.DARK_TUNNEL && this.maskLayer) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        }
        this.maskLayer = undefined;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon2.visible = false;
        if (this.casting) {

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
}