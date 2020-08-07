import {Game} from "../../../game";
import {ENEMY_TYPE} from "../../../enums/enums";
import {Enemy} from "../enemy";
import {PoisonHazard} from "../../hazards/poison";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {get8Directions, getChasingOptions, getRelativelyEmptyLitCardinalDirections} from "../../../utils/map_utils";
import {closestPlayer, getAngleForDirection, tileDistance} from "../../../utils/game_utils";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {moveEnemyInDirection} from "../../../enemy_movement_ai";

export class Mushroom extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["mushroom.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.name = "Mushroom";
        this.type = ENEMY_TYPE.MUSHROOM;
        this.atk = 1;
        this.poisonDelay = 6; //half of poison hazard lifetime
        this.currentPoisonDelay = this.poisonDelay;
        this.walkDelay = this.getWalkDelay();
        this.walking = false;
        this.walkingTexture = FCEnemiesSpriteSheet["mushroom_walking.png"];
        this.normalTexture = FCEnemiesSpriteSheet["mushroom.png"];
        this.standing = false;
        this.direction = null;
        this.setScaleModifier(0.95);
    }

    immediateReaction() {
        this.spillPoison();
    }

    move() {
        if (this.standing) {
            this.texture = this.normalTexture;
            this.walkDelay = this.getWalkDelay();
            this.currentPoisonDelay = 0;
            this.standing = false;
            this.place();
        } else if (this.walking) {
            moveEnemyInDirection(this, this.direction);
            this.standing = true;
            this.walking = false;
        } else if (this.walkDelay <= 0) {
            const directions = this.getDirections();
            if (directions.length === 0) {
                this.walkDelay += 4;
            } else {
                this.direction = randomChoice(directions);
                this.texture = this.walkingTexture;
                this.walking = true;
                this.correctScale();
                this.place();
            }
        } else {
            if (this.visible) this.walkDelay--;
            if (this.currentPoisonDelay <= 0) {
                this.spillPoison();
                this.currentPoisonDelay = this.poisonDelay;
            } else {
                this.currentPoisonDelay--;
            }
        }
    }

    spillPoison() {
        for (const dir of this.getPoisonDirs()) {
            const hazard = new PoisonHazard(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
            Game.world.addHazard(hazard);
        }
    }

    getPoisonDirs() {
        return get8Directions();
    }

    getWalkDelay() {
        return randomInt(8, 14);
    }

    onMoveFrame() {
        super.onMoveFrame();
        if (this.type !== ENEMY_TYPE.MUSHROOM && this.type !== ENEMY_TYPE.SMALL_MUSHROOM) return;
        if (this.standing || this.walking) {
            if (this.type === ENEMY_TYPE.SMALL_MUSHROOM) {
                this.intentIcon.position.y = this.position.y - this.height / 5 - this.intentIcon.height / 2;
            } else {
                this.intentIcon.position.y = this.position.y - this.height / 3 - this.intentIcon.height / 2;
            }
        }
    }

    correctScale() {
        if ((this.direction.x === 1 && this.scale.x < 0) || (this.direction.x === -1 && this.scale.x > 0)) {
            this.scale.x *= -1;
        } else if (this.direction.x === 0) {
            const playerDir = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
            if (playerDir === 0 || tileDistance(this, closestPlayer(this)) > 2) this.scale.x *= randomChoice([-1, 1]);
            else this.scale.x = playerDir * Math.abs(this.scale.x);
        }
    }

    getDirections() {
        let movementOptions = [];
        if (tileDistance(this, closestPlayer(this)) <= 2) {
            movementOptions = getChasingOptions(this, closestPlayer(this));
        }
        if (movementOptions.length === 0) movementOptions = getRelativelyEmptyLitCardinalDirections(this);
        return movementOptions;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.angle = 0;
        if (this.walking && tileDistance(this, closestPlayer(this)) <= 2) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
            this.intentIcon.angle = 0;
        } else if (this.walking) {
            this.intentIcon.texture = IntentsSpriteSheet["arrow_right.png"];
            this.intentIcon.angle = getAngleForDirection(this.direction);
        } else if (this.standing) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else if (this.currentPoisonDelay === 0) {
            this.intentIcon.texture = IntentsSpriteSheet["poison.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        }
    }
}