import {ENEMY_TYPE} from "../../../enums";
import {randomInt} from "../../../utils/random_utils";
import {Mushroom} from "./mushroom";
import {getCardinalDirections} from "../../../utils/map_utils";
import {FCEnemiesSpriteSheet} from "../../../loader";

export class SmallMushroom extends Mushroom {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["mushroom_small.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 1;
        this.type = ENEMY_TYPE.SMALL_MUSHROOM;
        this.atk = 1;
        this.walkingTexture = FCEnemiesSpriteSheet["mushroom_small_walking.png"];
        this.normalTexture = FCEnemiesSpriteSheet["mushroom_small.png"];
        this.setScaleModifier(0.9);
    }

    getWalkDelay() {
        return randomInt(4, 8);
    }

    getPoisonDirs() {
        return getCardinalDirections();
    }
}