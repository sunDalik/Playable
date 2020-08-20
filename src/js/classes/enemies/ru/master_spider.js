import {Spider} from "../fc/spider";
import {ENEMY_TYPE} from "../../../enums/enums";
import {isEmpty} from "../../../map_checks";
import {IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {randomDiagonalAggressiveAI} from "../../../enemy_movement_ai";
import {randomShuffle} from "../../../utils/random_utils";
import {closestPlayer, closestPlayerDiagonal, tileDistanceDiagonal} from "../../../utils/game_utils";

export class MasterSpider extends Spider {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["master_spider.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 2;
        this.atk = 1.25;
        this.name = "Master Spider";
        this.type = ENEMY_TYPE.MASTER_SPIDER;
        this.setScaleModifier(1.1);
    }

    move() {
        if (!this.thrown) {
            randomDiagonalAggressiveAI(this, this.noticeDistance);
        } else this.thrown = false;
    }

    throwAway(throwX, throwY) {
        if (throwX !== 0 || throwY !== 0) {
            let throwDirections = [{x: throwX + throwY, y: throwY + throwX}, {x: throwX - throwY, y: throwY - throwX}];
            randomShuffle(throwDirections);
            throwDirections = throwDirections.concat(randomShuffle([{x: throwY, y: throwX}, {x: -throwY, y: -throwX}]));
            throwDirections.push({x: throwX, y: throwY});
            for (const dir of throwDirections) {
                if (isEmpty(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                    this.throwStep(dir.x, dir.y);
                    return;
                }
            }
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.thrown) {
            this.intentIcon.texture = IntentsSpriteSheet["stun.png"];
        } else if (tileDistanceDiagonal(this, closestPlayerDiagonal(this), 1) <= this.noticeDistance) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }
}