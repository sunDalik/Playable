import {Star} from "../fc/star";
import {ENEMY_TYPE} from "../../../enums/enums";
import {getPlayerOnTile, isNotAWall} from "../../../map_checks";
import {DCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {getCardinalDirections, getDiagonalDirections} from "../../../utils/map_utils";

export class DeadStar extends Star {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["dead_star.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.type = ENEMY_TYPE.DEAD_STAR;
        this.name = "Dead Star";
        this.intentIcon2 = this.createIntentIcon();
        this.spikeColor = 0x616a7e;
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.triggered) this.attack();
            else {
                if (this.canAttackCardinally() || this.canAttackDiagonally()) {
                    this.triggered = true;
                    this.shake(1, 0);
                }
            }
        } else this.turnDelay--;
    }

    attack() {
        this.triggered = false;
        this.attackCardinal();
        this.attackDiagonal();
        this.turnDelay = 2;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon2.visible = !this.dead;
        this.intentIcon.angle = this.intentIcon2.angle = 0;
        if (this.triggered) {
            this.intentIcon.texture = IntentsSpriteSheet["spikes.png"];
            this.intentIcon.angle = 45;
            this.intentIcon2.texture = IntentsSpriteSheet["spikes.png"];
        } else {
            this.intentIcon2.visible = false;
        }
    }

    canAttackCardinally() {
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) return true;
            if (isNotAWall(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                for (const dir2 of getCardinalDirections()) {
                    if (getPlayerOnTile(this.tilePosition.x + dir.x + dir2.x, this.tilePosition.y + dir.y + dir2.y)) return true;
                }
            }
        }

        return false;
    }

    canAttackDiagonally() {
        for (const dir of getDiagonalDirections()) {
            // check diagonal tiles at distance 2
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) return true;
            if (isNotAWall(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                // check tiles near to previous ones
                for (const dir2 of getCardinalDirections()) {
                    if (getPlayerOnTile(this.tilePosition.x + dir.x + dir2.x, this.tilePosition.y + dir.y + dir2.y)) return true;
                }
                // check diagonal tiles at distance 4
                if (getPlayerOnTile(this.tilePosition.x + dir.x * 2, this.tilePosition.y + dir.y * 2)) return true;

                // check tiles near to previous ones
                if (isNotAWall(this.tilePosition.x + dir.x * 2, this.tilePosition.y + dir.y * 2)) {
                    for (const dir2 of getCardinalDirections()) {
                        if (getPlayerOnTile(this.tilePosition.x + dir.x * 2 + dir2.x, this.tilePosition.y + dir.y * 2 + dir2.y)) return true;
                    }
                }
            }
        }

        return false;
    }
}