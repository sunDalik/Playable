import {ENEMY_TYPE} from "../../../enums/enums";
import {getPlayerOnTile} from "../../../map_checks";
import {FCEnemiesSpriteSheet} from "../../../loader";
import {getDiagonalDirections} from "../../../utils/map_utils";
import {Star} from "./star";

export class MiniStar extends Star {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["mini_star.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.health = this.maxHealth = 2;
        this.name = "Mini Star";
        this.atk = 0.75;
        this.type = ENEMY_TYPE.MINI_STAR;
        this.spikeColor = 0x47b4c4;
    }


    attackDiagonal() {
        this.attackTileAtOffset(-1, -1);
        this.attackTileAtOffset(1, 1);
        this.attackTileAtOffset(-1, 1);
        this.attackTileAtOffset(1, -1);

        this.createSpikeAnimation(-1, -1);
        this.createSpikeAnimation(1, -1);
        this.createSpikeAnimation(-1, 1);
        this.createSpikeAnimation(1, 1);
    }

    canAttackDiagonally() {
        for (const dir of getDiagonalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) return true;
        }
        return false;
    }
}