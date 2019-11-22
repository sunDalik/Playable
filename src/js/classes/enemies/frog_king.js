import {Game} from "../../game"
import {ENEMY_TYPE} from "../../enums";
import {Frog} from "./frog";
import {getPlayerOnTile} from "../../map_checks";

export class KingFrog extends Frog {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/frog_king.png"].texture) {
        super(tilePositionX, tilePositionY, texture);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.FROG_KING;
        this.atk = 1.25;
    }

    arePlayersInAttackRange() {
        if (getPlayerOnTile(this.tilePosition.x + 2 * Math.sign(this.scale.x), this.tilePosition.y) !== null) {
            this.triggeredTile = {x: this.tilePosition.x + 2 * Math.sign(this.scale.x), y: this.tilePosition.y};
            this.shake(0, 1);
        } else if (getPlayerOnTile(this.tilePosition.x - 2 * Math.sign(this.scale.x), this.tilePosition.y) !== null) {
            this.triggeredTile = {x: this.tilePosition.x - 2 * Math.sign(this.scale.x), y: this.tilePosition.y};
            this.shake(0, 1);
            this.scale.x *= -1;
        } else if (getPlayerOnTile(this.tilePosition.x, this.tilePosition.y - 2) !== null) {
            this.triggeredTile = {x: this.tilePosition.x, y: this.tilePosition.y - 2};
            this.shake(1, 0);
        } else if (getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + 2) !== null) {
            this.triggeredTile = {x: this.tilePosition.x, y: this.tilePosition.y + 2};
            this.shake(1, 0);
        } else return false;
        return true;
    }
}