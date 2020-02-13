import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {closestPlayer, otherPlayer, tileDistance} from "../../utils/game_utils";
import {getCardinalDirections} from "../../utils/map_utils";
import {blowAwayInDirection} from "../../special_move_logic";

export class TeleportMage extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/teleport_mage.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.TELEPORT_MAGE;
        this.atk = 0;
        this.SLIDE_ANIMATION_TIME = 5;
        this.turnDelay = 2;
        this.currentTurnDelay = this.turnDelay;
        this.casting = false;
        this.cooldown = 10;
        this.currentCooldown = 0;
        this.castDistance = 10;
        this.dangerDistance = 3;
        this.castTime = 3;
        this.currentCastTime = this.castTime;
        this.targetedPlayer = null;
    }

    move() {
        if (this.casting) {
            this.currentCooldown = this.cooldown;
            this.currentCastTime--;
            if (this.currentCastTime <= 0) {
                this.targetedPlayer.removeFromMap();
                this.removeFromMap();
                const tempPos = {x: this.tilePosition.x, y: this.this.tilePosition.y};
                this.tilePosition.x = this.targetedPlayer.tilePosition.x;
                this.tilePosition.y = this.targetedPlayer.tilePosition.y;
                this.targetedPlayer.tilePosition.x = tempPos.x;
                this.targetedPlayer.tilePosition.y = tempPos.y;
                this.targetedPlayer.placeOnMap();
                this.blowAwayFromPlayerPosition(this.targetedPlayer);
                if (!otherPlayer(this.targetedPlayer).dead
                    && otherPlayer(this.targetedPlayer).tilePosition.x === this.tilePosition.x
                    && otherPlayer(this.targetedPlayer).tilePosition.y === this.tilePosition.y) {
                    this.die();
                    otherPlayer(this.targetedPlayer).damage(1, this, false, true);
                }
            }
        } else if (this.currentCooldown <= 0 && tileDistance(this, closestPlayer(this)) <= this.castDistance) {
            this.casting = true;
            this.currentCastTime = this.castTime;
            this.targetedPlayer = closestPlayer(this);
            //change texture
        } else {
            //move
        }
        this.currentCooldown--;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.casting) {
            if (this.currentCastTime === 1) {

            } else {

            }
        } else if (this.currentTurnDelay <= 0) {

        } else {

        }
    }

    blowAwayFromPlayerPosition(player) {
        for (const dir of getCardinalDirections()) {
            blowAwayInDirection(player.tilePosition, dir);
        }
    }
}