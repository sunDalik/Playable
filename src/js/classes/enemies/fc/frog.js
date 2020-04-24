import {Game} from "../../../game"
import {Enemy} from "../enemy"
import {ENEMY_TYPE} from "../../../enums";
import {getPlayerOnTile, isAnyWall, isInanimate, isNotAWall} from "../../../map_checks";
import {PoisonHazard} from "../../hazards/poison";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {randomAfraidAI} from "../../../enemy_movement_ai";

export class Frog extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["frog.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 2;
        this.type = ENEMY_TYPE.FROG;
        this.atk = 1;
        this.turnDelay = 1;
        this.currentTurnDelay = this.turnDelay;
        this.triggered = false;
        this.triggeredTile = null;
        this.setScaleModifier(1.1);
    }

    afterMapGen() {
        if (isAnyWall(this.tilePosition.x + 1, this.tilePosition.y)
            || isInanimate(this.tilePosition.x + 1, this.tilePosition.y)) {
            this.scale.x *= -1;
        }
    }

    move() {
        if (this.triggered) {
            this.triggered = false;
            this.bump(Math.sign(this.triggeredTile.x - this.tilePosition.x), Math.sign(this.triggeredTile.y - this.tilePosition.y));
            this.attackPlayer(this.triggeredTile.x, this.triggeredTile.y);
            this.spitHazard(this.triggeredTile.x, this.triggeredTile.y);
            this.currentTurnDelay = 0;
        } else if (this.arePlayersInAttackRange()) {
            this.triggered = true;
        } else if (this.currentTurnDelay <= 0) {
            randomAfraidAI(this);
        } else this.currentTurnDelay--;
    }

    arePlayersInAttackRange() {
        if (isNotAWall(this.tilePosition.x + Math.sign(this.scale.x), this.tilePosition.y) && getPlayerOnTile(this.tilePosition.x + 2 * Math.sign(this.scale.x), this.tilePosition.y) !== null) {
            this.triggeredTile = {x: this.tilePosition.x + 2 * Math.sign(this.scale.x), y: this.tilePosition.y};
            this.shake(0, 1);
        } else if (isNotAWall(this.tilePosition.x - Math.sign(this.scale.x), this.tilePosition.y) && getPlayerOnTile(this.tilePosition.x - 2 * Math.sign(this.scale.x), this.tilePosition.y) !== null) {
            this.triggeredTile = {x: this.tilePosition.x - 2 * Math.sign(this.scale.x), y: this.tilePosition.y};
            this.shake(0, 1);
            this.scale.x *= -1;
        } else return false;
        return true;
    }

    attackPlayer(tileX, tileY) {
        let player = getPlayerOnTile(tileX, tileY);
        if (player) player.damage(this.atk, this, false);
        player = getPlayerOnTile(this.tilePosition.x + Math.floor((tileX - this.tilePosition.x) / 2),
            this.tilePosition.y + Math.floor((tileY - this.tilePosition.y) / 2));
        if (player) player.damage(this.atk, this, false);
    }

    spitHazard(tileX, tileY) {
        Game.world.addHazard(new PoisonHazard(tileX, tileY));
        Game.world.addHazard(new PoisonHazard(this.tilePosition.x + Math.floor((tileX - this.tilePosition.x) / 2),
            this.tilePosition.y + Math.floor((tileY - this.tilePosition.y) / 2)));
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.triggered) {
            this.intentIcon.texture = IntentsSpriteSheet["poison.png"];
        } else if (this.currentTurnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else if (tileDistance(this, closestPlayer(this)) <= 2) {
            this.intentIcon.texture = IntentsSpriteSheet["fear.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }
}