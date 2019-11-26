import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {randomChoice} from "../../utils/random_utils";
import {addHazardOrRefresh, getRelativelyEmptyCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile, isNotAWall} from "../../map_checks";
import {PoisonHazard} from "../hazards/poison_hazard";

export class Frog extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/frog.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.FROG;
        this.atk = 1;
        this.turnDelay = 1;
        this.currentTurnDelay = 0;
        this.triggered = false;
        this.triggeredTile = null;
    }

    fitToTile() {
        const scaleX = Game.TILESIZE / this.getUnscaledWidth();
        const scaleY = Game.TILESIZE / this.getUnscaledHeight();
        this.scale.set(scaleX, scaleY);
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
            const movementOptions = getRelativelyEmptyCardinalDirections(this);
            if (movementOptions.length !== 0) {
                const moveDir = randomChoice(movementOptions);
                if (moveDir.x !== 0 && Math.sign(moveDir.x) !== Math.sign(this.scale.x)) {
                    this.scale.x *= -1;
                }
                const player = getPlayerOnTile(this.tilePosition.x + moveDir.x, this.tilePosition.y + moveDir.y);
                if (player) {
                    this.bump(moveDir.x, moveDir.y);
                    player.damage(this.atk, this, true);
                } else {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
                    this.step(moveDir.x, moveDir.y);
                    this.updateMapPosition();
                }
                this.currentTurnDelay = this.turnDelay;
            }
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
        addHazardOrRefresh(new PoisonHazard(tileX, tileY));
        addHazardOrRefresh(new PoisonHazard(this.tilePosition.x + Math.floor((tileX - this.tilePosition.x) / 2),
            this.tilePosition.y + Math.floor((tileY - this.tilePosition.y) / 2)));
    }
}