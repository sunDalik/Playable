import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums/enums";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {getAngleForDirection} from "../../../utils/game_utils";
import {moveEnemyInDirection} from "../../../enemy_movement_ai";
import {randomChoice, randomShuffle} from "../../../utils/random_utils";
import {isAnyWallOrInanimate} from "../../../map_checks";

export class Crab extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["crab.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 1;
        this.name = "Crab";
        this.atk = 1;
        this.direction = {x: 1, y: 0};
        this.type = ENEMY_TYPE.CRAB;
        this.tallModifier = -3;
    }

    afterMapGen() {
        const possibleDirections = randomShuffle(this.getStartingDirections());
        for (const dir of possibleDirections) {
            let good = true;
            let checkDir = {x: dir.x, y: dir.y};
            let currentPosition = {x: this.tilePosition.x, y: this.tilePosition.y};
            for (let i = 0; i < 4; i++) {
                if (isAnyWallOrInanimate(currentPosition.x + checkDir.x, currentPosition.y + checkDir.y)) {
                    good = false;
                    break;
                }
                currentPosition.x += checkDir.x;
                currentPosition.y += checkDir.y;
                checkDir = this.getNewDirection(checkDir);
            }
            if (good) {
                this.direction = dir;
                return;
            }
        }
        this.direction = randomChoice(possibleDirections);
    }

    getStartingDirections() {
        return [{x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}];
    }

    move() {
        if (moveEnemyInDirection(this, this.direction)) {
            this.direction = this.getNewDirection(this.direction);
        }
    }

    getNewDirection(direction) {
        // clockwise
        if (direction.x === 1) {
            return {x: 0, y: 1};
        } else if (direction.y === 1) {
            return {x: -1, y: 0};
        } else if (direction.x === -1) {
            return {x: 0, y: -1};
        } else if (direction.y === -1) {
            return {x: 1, y: 0};
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.texture = IntentsSpriteSheet["arrow_right.png"];
        this.intentIcon.angle = getAngleForDirection(this.direction);
    }
}