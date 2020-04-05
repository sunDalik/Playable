import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {Enemy} from "./enemy";
import {ENEMY_TYPE, ROLE, STAGE} from "../../enums";
import {closestPlayer, tileDistance} from "../../utils/game_utils";
import {getPlayerOnTile, isAnyWall, isInanimate} from "../../map_checks";
import {createFadingAttack} from "../../animations";
import {TileElement} from "../tile_elements/tile_element";
import {DTEnemiesSpriteSheet, IntentsSpriteSheet} from "../../loader";
import {wallTallness} from "../draw/wall";

export class LaserTurret extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = DTEnemiesSpriteSheet["laser_turret_unready.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.atk = 1;
        this.triggered = false;
        this.type = ENEMY_TYPE.LASER_TURRET;
        this.turnDelay = 3;
        this.currentTurnDelay = 1;
        this.movable = false;
        this.role = ROLE.WALL_TRAP;
        this.noticeTileDistance = 5;
        this.canMoveInvisible = true;
        this.directionX = 1;
        this.removeShadow();
    }

    afterMapGen() {
        if (isAnyWall(this.tilePosition.x + 1, this.tilePosition.y)
            || isInanimate(this.tilePosition.x + 1, this.tilePosition.y)) {
            this.scale.x *= -1;
            this.directionX = -1;
        } else if (isAnyWall(this.tilePosition.x - 1, this.tilePosition.y)
            || isInanimate(this.tilePosition.x - 1, this.tilePosition.y)) {
            this.directionX = 1;
        } else {
            if (Math.random() < 0.5) {
                this.scale.x *= -1;
                this.directionX = -1;
            } else {
                this.directionX = 1;
            }
        }

    }

    move() {
        if (this.maskLayer === undefined) {
            if (tileDistance(this, closestPlayer(this)) <= this.noticeTileDistance) {
                this.visible = true;
                this.maskLayer = {};
                if (Game.stage === STAGE.DARK_TUNNEL) {
                    Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
                }
                this.updateTexture();
            }
        } else if (this.triggered) {
            this.attack();
            this.triggered = false;
            this.currentTurnDelay = this.turnDelay;
            this.justAttacked = true;
            this.updateTexture();
        } else if (this.currentTurnDelay <= 0) {
            for (let x = this.directionX; ; x += this.directionX) {
                if (isAnyWall(this.tilePosition.x + x, this.tilePosition.y)) break;
                const player = getPlayerOnTile(this.tilePosition.x + x, this.tilePosition.y);
                if (player) {
                    this.triggered = true;
                    this.updateTexture();
                    this.shake(1.2, 0);
                }
            }
        } else {
            this.currentTurnDelay--;
            this.updateTexture();
        }
    }

    attack() {
        for (let x = this.directionX; ; x += this.directionX) {
            if (isAnyWall(this.tilePosition.x + x, this.tilePosition.y)) break;
            const attackSprite = new TileElement(PIXI.Texture.WHITE, this.tilePosition.x + x, this.tilePosition.y, true);
            attackSprite.zIndex = 5;
            attackSprite.tint = 0xFF0000;
            attackSprite.width = Game.TILESIZE;
            attackSprite.height = Game.TILESIZE / 3;
            if (Game.stage === STAGE.DARK_TUNNEL) attackSprite.maskLayer = {};
            createFadingAttack(attackSprite);
            const player = getPlayerOnTile(this.tilePosition.x + x, this.tilePosition.y);
            if (player) player.damage(this.atk, this, false, true);
        }
    }

    updateTexture() {
        if (this.justAttacked) {
            this.texture = DTEnemiesSpriteSheet["laser_turret_after_attack.png"];
            this.justAttacked = false;
        } else if (this.triggered) {
            this.texture = DTEnemiesSpriteSheet["laser_turret_triggered.png"];
        } else if (this.currentTurnDelay > 0) {
            this.texture = DTEnemiesSpriteSheet["laser_turret_unready.png"];
        } else {
            this.texture = DTEnemiesSpriteSheet["laser_turret_awake.png"];
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        if (this.triggered) {
            this.intentIcon.texture = IntentsSpriteSheet["laser.png"];
        } else if (this.currentTurnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["eye.png"];
        }
    }

    place() {
        this.position.x = Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
        this.position.y = Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
        if (this.healthContainer) {
            this.onMoveFrame();
        }
    }
}