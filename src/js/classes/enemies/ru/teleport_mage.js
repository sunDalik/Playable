import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums";
import {closestPlayer, otherPlayer, tileDistance} from "../../../utils/game_utils";
import {getCardinalDirections} from "../../../utils/map_utils";
import {blowAwayInDirection} from "../../../special_move_logic";
import {isEnemy} from "../../../map_checks";
import {createPlayerAttackTile, rotate} from "../../../animations";
import {randomChoice} from "../../../utils/random_utils";
import {camera} from "../../game/camera";
import {MILD_DARK_GLOW_FILTER, MILD_WHITE_GLOW_FILTER} from "../../../filters";
import {updateChain} from "../../../drawing/draw_dunno";
import {IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {randomAfraidAI} from "../../../enemy_movement_ai";

export class TeleportMage extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["teleport_mage.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 3;
        this.type = ENEMY_TYPE.TELEPORT_MAGE;
        this.atk = 0;
        this.SLIDE_ANIMATION_TIME = 5;
        this.turnDelay = 2;
        this.currentTurnDelay = this.turnDelay;
        this.casting = false;
        this.cooldown = 12;
        this.currentCooldown = Math.floor(this.cooldown / 3);
        this.castDistance = 5;
        this.dangerDistance = 3;
        this.castTime = 2;
        this.currentCastTime = this.castTime;
        this.targetedPlayer = null;
        this.setScaleModifier(1.1);
    }

    move() {
        this.correctScale();
        if (this.casting) {
            this.currentCooldown = this.cooldown;
            this.currentCastTime--;
            if (this.currentCastTime === 1) this.texture = RUEnemiesSpriteSheet["teleport_mage_cast.png"];
            else if (this.currentCastTime <= 0) {
                this.casting = false;
                this.currentTurnDelay = this.turnDelay;
                this.texture = RUEnemiesSpriteSheet["teleport_mage.png"];
                const tempPos = {x: this.tilePosition.x, y: this.tilePosition.y};
                this.targetedPlayer.removeFromMap();
                this.setTilePosition(this.targetedPlayer.tilePosition.x, this.targetedPlayer.tilePosition.y);
                this.targetedPlayer.setTilePosition(tempPos.x, tempPos.y);
                updateChain();
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
            this.texture = RUEnemiesSpriteSheet["teleport_mage_prepare.png"];
        } else if (this.currentTurnDelay <= 0) {
            randomAfraidAI(this, this.dangerDistance, false, true);
        } else {
            this.currentTurnDelay--;
        }
        this.currentCooldown--;
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.filters = [];
        if (this.casting) {
            if (this.currentCastTime === 1) {
                this.intentIcon.texture = IntentsSpriteSheet["magic.png"];
            } else {
                this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
            }
            if (this.targetedPlayer === Game.player) this.intentIcon.filters = [MILD_WHITE_GLOW_FILTER];
            else this.intentIcon.filters = [MILD_DARK_GLOW_FILTER];
        } else if (this.currentTurnDelay <= 0) {
            if (tileDistance(this, closestPlayer(this)) <= this.dangerDistance) {
                this.intentIcon.texture = IntentsSpriteSheet["fear.png"];
            } else {
                this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
            }
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        }
    }

    blowAwayFromPlayerPosition(player) {
        for (const dir of getCardinalDirections()) {
            if (isEnemy(player.tilePosition.x + dir.x, player.tilePosition.y + dir.y)
                && Game.map[player.tilePosition.y + dir.y][player.tilePosition.x + dir.x].entity.type !== ENEMY_TYPE.WALL_SLIME) { //temporary fix
                Game.map[player.tilePosition.y + dir.y][player.tilePosition.x + dir.x].entity.stun++;
                blowAwayInDirection(player.tilePosition, dir);
            }
        }
    }

    correctScale() {
        if (this.casting) {
            if (this.targetedPlayer.tilePosition.x !== this.tilePosition.x) {
                this.scale.x = Math.sign(this.targetedPlayer.tilePosition.x - this.tilePosition.x) * Math.abs(this.scale.x);
            }
        } else {
            const sign = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
            if (sign !== 0) {
                this.scale.x = sign * Math.abs(this.scale.x);
            }
        }
    }
}