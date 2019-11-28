import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {getRandomInt} from "../../utils/random_utils";
import {Mushroom} from "./mushroom";
import {getRelativelyEmptyCardinalDirections} from "../../utils/map_utils";

export class SmallMushroom extends Mushroom {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/mushroom_small.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SMALL_MUSHROOM;
        this.atk = 0.5;
        this.poisonSpread = 1;
        this.walkingTexture = Game.resources["src/images/enemies/mushroom_small_walking.png"].texture;
        this.normalTexture = Game.resources["src/images/enemies/mushroom_small.png"].texture;
        this.healOnHit = 0.5;
    }

    getWalkDelay() {
        return getRandomInt(4, 9);
    }

    getDirections() {
        return getRelativelyEmptyCardinalDirections(this);
    }
}