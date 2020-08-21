import {ENEMY_TYPE} from "../../../enums/enums";
import {DTEnemiesSpriteSheet} from "../../../loader";
import {Crab} from "../fc/crab";

export class DarkCrab extends Crab {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["dark_crab.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Dark Crab";
        this.health = this.maxHealth = 2;
        this.direction = {x: 1, y: 1};
        this.type = ENEMY_TYPE.DARK_CRAB;
    }

    getStartingDirections() {
        return [{x: 1, y: -1}, {x: 1, y: 1}, {x: -1, y: 1}, {x: -1, y: -1}];
    }

    getNewDirection(direction) {
        // clockwise diagonal
        if (direction.x === 1 && direction.y === 1) {
            return {x: -1, y: 1};
        } else if (direction.x === -1 && direction.y === 1) {
            return {x: -1, y: -1};
        } else if (direction.x === -1 && direction.y === -1) {
            return {x: 1, y: -1};
        } else if (direction.x === 1 && direction.y === -1) {
            return {x: 1, y: 1};
        }
    }
}