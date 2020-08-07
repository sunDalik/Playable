import {ENEMY_TYPE} from "../../../enums/enums";
import {Frog} from "./frog";
import {getPlayerOnTile, isNotAWall} from "../../../map_checks";
import {FCEnemiesSpriteSheet} from "../../../loader";

export class KingFrog extends Frog {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["frog_king.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 3;
        this.name = "King Frog";
        this.type = ENEMY_TYPE.FROG_KING;
        this.atk = 1;
        this.setScaleModifier(1.15);
    }

    arePlayersInAttackRange() {
        if (isNotAWall(this.tilePosition.x + Math.sign(this.scale.x), this.tilePosition.y) && getPlayerOnTile(this.tilePosition.x + 2 * Math.sign(this.scale.x), this.tilePosition.y) !== null) {
            this.triggeredTile = {x: this.tilePosition.x + 2 * Math.sign(this.scale.x), y: this.tilePosition.y};
            this.shake(0, 1);
        } else if (isNotAWall(this.tilePosition.x - Math.sign(this.scale.x), this.tilePosition.y) && getPlayerOnTile(this.tilePosition.x - 2 * Math.sign(this.scale.x), this.tilePosition.y) !== null) {
            this.triggeredTile = {x: this.tilePosition.x - 2 * Math.sign(this.scale.x), y: this.tilePosition.y};
            this.shake(0, 1);
            this.scale.x *= -1;
        } else if (isNotAWall(this.tilePosition.x, this.tilePosition.y - 1) && getPlayerOnTile(this.tilePosition.x, this.tilePosition.y - 2) !== null) {
            this.triggeredTile = {x: this.tilePosition.x, y: this.tilePosition.y - 2};
            this.shake(1, 0);
        } else if (isNotAWall(this.tilePosition.x, this.tilePosition.y + 1) && getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + 2) !== null) {
            this.triggeredTile = {x: this.tilePosition.x, y: this.tilePosition.y + 2};
            this.shake(1, 0);
        } else return false;
        return true;
    }
}