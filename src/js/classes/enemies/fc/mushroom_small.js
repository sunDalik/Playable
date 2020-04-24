import {ENEMY_TYPE} from "../../../enums";
import {randomInt} from "../../../utils/random_utils";
import {Mushroom} from "./mushroom";
import {getChasingOptions, getRelativelyEmptyLitCardinalDirections} from "../../../utils/map_utils";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";

export class SmallMushroom extends Mushroom {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["mushroom_small.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 1;
        this.type = ENEMY_TYPE.SMALL_MUSHROOM;
        this.atk = 1;
        this.poisonSpread = 1;
        this.walkingTexture = FCEnemiesSpriteSheet["mushroom_small_walking.png"];
        this.normalTexture = FCEnemiesSpriteSheet["mushroom_small.png"];
        this.healOnHit = 0.5;
        this.setScaleModifier(0.9);
    }

    getWalkDelay() {
        return randomInt(4, 8);
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
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
            this.intentIcon.angle = 0;
        }
    }
}