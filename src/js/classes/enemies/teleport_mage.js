import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE} from "../../enums";
import {closestPlayer, otherPlayer, tileDistance} from "../../utils/game_utils";
import {getCardinalDirections} from "../../utils/map_utils";
import {blowAwayInDirection} from "../../special_move_logic";
import {isEnemy} from "../../map_checks";
import {createPlayerAttackTile, rotate} from "../../animations";
import {randomChoice} from "../../utils/random_utils";
import {camera} from "../game/camera";

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
        this.currentCooldown = Math.floor(this.cooldown / 3);
        this.castDistance = 8;
        this.dangerDistance = 3;
        this.castTime = 3;
        this.currentCastTime = this.castTime;
        this.targetedPlayer = null;
        this.scaleModifier = 1.1;
        this.fitToTile();
    }

    move() {
        if (this.casting) {
            this.currentCooldown = this.cooldown;
            this.currentCastTime--;
            if (this.currentCastTime === 1) this.texture = Game.resources["src/images/enemies/teleport_mage_cast.png"].texture;
            else if (this.currentCastTime <= 0) {
                this.casting = false;
                this.currentTurnDelay = this.turnDelay;
                this.texture = Game.resources["src/images/enemies/teleport_mage.png"].texture;
                const tempPos = {x: this.tilePosition.x, y: this.tilePosition.y};
                this.targetedPlayer.removeFromMap();
                this.setTilePosition(this.targetedPlayer.tilePosition.x, this.targetedPlayer.tilePosition.y);
                this.targetedPlayer.setTilePosition(tempPos.x, tempPos.y);
                rotate(this.targetedPlayer, randomChoice([true, false]));
                createPlayerAttackTile(this.targetedPlayer.tilePosition);
                camera.moveToCenter(5);
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
            this.texture = Game.resources["src/images/enemies/teleport_mage_prepare.png"].texture;
        } else if (this.currentTurnDelay <= 0) {
            //move
            this.currentTurnDelay = this.turnDelay
        } else {
            this.currentTurnDelay--;
        }
        this.currentCooldown--;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.casting) {
            if (this.currentCastTime === 1) {
                this.intentIcon.texture = Game.resources["src/images/icons/intents/magic.png"].texture;
            } else {
                this.intentIcon.texture = Game.resources["src/images/icons/intents/hourglass.png"].texture;
            }
        } else if (this.currentTurnDelay <= 0) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/question_mark.png"].texture;
        } else {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/hourglass.png"].texture;
        }
    }

    blowAwayFromPlayerPosition(player) {
        for (const dir of getCardinalDirections()) {
            if (isEnemy(player.tilePosition.x + dir.x, player.tilePosition.y + dir.y)) {
                Game.map[player.tilePosition.y + dir.y][player.tilePosition.x + dir.x].entity.stun++;
                blowAwayInDirection(player.tilePosition, dir);
            }
        }
    }
}