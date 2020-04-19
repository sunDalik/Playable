import {Game} from "../../../game"
import {ENEMY_TYPE, STAGE} from "../../../enums";
import {Enemy} from "../enemy";
import {randomInt, randomChoice} from "../../../utils/random_utils";
import {getEmptyCardinalDirections} from "../../../utils/map_utils";
import {Spider} from "./spider";
import {GraySpider} from "./spider_gray";
import {GreenSpider} from "../dt/spider_green";
import {RedSpider} from "../dt/spider_red";
import {ITEM_OUTLINE_FILTER_SMALL} from "../../../filters";
import {DTEnemiesSpriteSheet, FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";

export class Cocoon extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["cocoon.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.COCOON;
        this.atk = 0;
        this.spawnDelay = randomInt(3, 7);
        this.getMinionType();
        if (this.minionType === Spider || this.minionType === RedSpider) this.getMinionType(); // lower chance for black spiders and red spiders
        this.minion = null;
        this.aboutToSpawn = false;
        this.scaleModifier = 0.9;
        this.fitToTile();
    }

    move() {
        if (this.aboutToSpawn) {
            this.spawnDelay = this.getSpawnDelay();
            const dir = randomChoice(getEmptyCardinalDirections(this));
            if (dir === undefined) {
                this.shake(1, 0);
            } else {
                this.minion = new this.minionType(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
                this.minion.stun = 2;
                this.minion.energyDrop = 0;
                Game.world.addEnemy(this.minion);
                this.aboutToSpawn = false;
            }
        } else if (this.spawnDelay <= 0 && (this.minion === null || this.minion.dead)) {
            this.aboutToSpawn = true;
            this.shake(1, 0);
        } else this.spawnDelay--;
    }

    getSpawnDelay() {
        return randomInt(8, 13);
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
            this.intentIcon.filters = [ITEM_OUTLINE_FILTER_SMALL];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
            this.intentIcon.filters = [];
        }
    }

    getMinionType() {
        if (Game.stage === STAGE.FLOODED_CAVE) {
            this.minionType = randomChoice([Spider, GraySpider]);
        } else {
            this.minionType = randomChoice([Spider, GraySpider, GreenSpider, RedSpider]);
        }
    }
}