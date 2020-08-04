import {Game} from "../../../game";
import {ENEMY_QUIRK, ENEMY_TYPE, STAGE} from "../../../enums/enums";
import {Enemy} from "../enemy";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {getEmptyCardinalDirections} from "../../../utils/map_utils";
import {Spider} from "./spider";
import {GraySpider} from "./spider_gray";
import {GreenSpider} from "../dt/spider_green";
import {RedSpider} from "../dt/spider_red";
import {ITEM_OUTLINE_FILTER_SMALL} from "../../../filters";
import {DTEnemiesSpriteSheet, FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {SpiderSmall} from "./spider_small";

export class Cocoon extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["cocoon.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 3;
        this.type = ENEMY_TYPE.COCOON;
        this.atk = 0;
        this.spawnDelay = randomInt(3, 6);
        this.getMinionType();
        this.minion = null;
        this.aboutToSpawn = false;
    }

    move() {
        if (this.aboutToSpawn) {
            this.spawnDelay = this.getSpawnDelay();
            if (this.quirk === ENEMY_QUIRK.GIANT) this.spawnDelay += 3;
            const dir = randomChoice(getEmptyCardinalDirections(this));
            if (dir === undefined) {
                this.shake(1, 0);
            } else {
                this.minion = new this.minionType(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
                this.minion.setQuirk(this.quirk);
                this.minion.setStun(2);
                Game.world.addEnemy(this.minion, true);
                this.aboutToSpawn = false;
            }
        } else if (this.spawnDelay <= 0 && (this.minion === null || this.minion.dead)) {
            this.aboutToSpawn = true;
            this.shake(1, 0);
        } else this.spawnDelay--;
    }

    getSpawnDelay() {
        if (this.minionType === Spider) {
            return randomInt(10, 16);
        } else if (this.minionType === GraySpider) {
            return randomInt(10, 16);
        } else if (this.minionType === SpiderSmall) {
            return randomInt(4, 8);
        } else if (this.minionType === GreenSpider) {
            return randomInt(8, 14);
        } else if (this.minionType === RedSpider) {
            return randomInt(12, 18);
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.aboutToSpawn) {
            if (this.minionType === Spider)
                this.intentIcon.texture = FCEnemiesSpriteSheet["spider.png"];
            else if (this.minionType === GraySpider)
                this.intentIcon.texture = FCEnemiesSpriteSheet["spider_b.png"];
            else if (this.minionType === GreenSpider)
                this.intentIcon.texture = DTEnemiesSpriteSheet["spider_green.png"];
            else if (this.minionType === RedSpider)
                this.intentIcon.texture = DTEnemiesSpriteSheet["spider_red.png"];
            else if (this.minionType === SpiderSmall)
                this.intentIcon.texture = FCEnemiesSpriteSheet["spider_small.png"];
            this.intentIcon.filters = [ITEM_OUTLINE_FILTER_SMALL];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
            this.intentIcon.filters = [];
        }
    }

    getMinionType() {
        const random = Math.random();
        if (Game.stage === STAGE.FLOODED_CAVE) {
            if (random > 0.9) {
                this.minionType = Spider;
            } else if (random > 0.7) {
                this.minionType = GraySpider;
            } else {
                this.minionType = SpiderSmall;
            }
        } else {
            if (random > 0.96) {
                this.minionType = RedSpider;
            } else if (random > 0.75) {
                this.minionType = GraySpider;
            } else if (random > 0.6) {
                this.minionType = Spider;
            } else {
                this.minionType = GreenSpider;
            }
        }
    }
}