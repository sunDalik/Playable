import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {getRandomInt} from "../../utils/random_utils";
import {Mushroom} from "./mushroom";
import {getChasingOptions, getRelativelyEmptyLitCardinalDirections} from "../../utils/map_utils";
import {closestPlayer, tileDistance} from "../../utils/game_utils";

export class SmallMushroom extends Mushroom {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/mushroom_small.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.SMALL_MUSHROOM;
        this.atk = 1;
        this.poisonSpread = 1;
        this.walkingTexture = Game.resources["src/images/enemies/mushroom_small_walking.png"].texture;
        this.normalTexture = Game.resources["src/images/enemies/mushroom_small.png"].texture;
        this.healOnHit = 0.5;
    }

    getWalkDelay() {
        return getRandomInt(4, 8);
    }

    getDirections() {
        let movementOptions;
        if (tileDistance(this, closestPlayer(this)) <= 2) {
            movementOptions = getChasingOptions(this, closestPlayer(this));
            if (movementOptions.length === 0) movementOptions = getRelativelyEmptyLitCardinalDirections(this);
        } else movementOptions = getRelativelyEmptyLitCardinalDirections(this);
        return movementOptions;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.walking && tileDistance(this, closestPlayer(this)) <= 2) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/anger.png"].texture;
            this.intentIcon.angle = 0;
        }
    }
}