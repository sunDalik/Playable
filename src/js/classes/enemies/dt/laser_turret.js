import * as PIXI from "pixi.js";
import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE, ROLE, STAGE, TILE_TYPE} from "../../../enums/enums";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {getPlayerOnTile, isAnyWall} from "../../../map_checks";
import {createFadingAttack} from "../../../animations";
import {TileElement} from "../../tile_elements/tile_element";
import {DTEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {redrawMiniMapPixel} from "../../../drawing/minimap";

export class LaserTurret extends Enemy {
    constructor(tilePositionX, tilePositionY, directionX, texture = DTEnemiesSpriteSheet["laser_turret_unready.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 1;
        this.name = "Laser Turret";
        this.atk = 1;
        this.triggered = false;
        this.type = ENEMY_TYPE.LASER_TURRET;
        this.turnDelay = 4;
        this.currentTurnDelay = 1;
        this.movable = false;
        this.role = ROLE.WALL_TRAP;
        this.noticeTileDistance = 5;
        this.canMoveInvisible = true;
        this.directionX = directionX;
        this.scale.x = Math.abs(this.scale.x) * this.directionX;
        this.removeShadow();
    }

    revive() {
        return false;
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
            for (let x = this.directionX; Math.abs(x) <= 6; x += this.directionX) {
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

    getTilePositionX() {
        return Game.TILESIZE * this.tilePosition.x + (Game.TILESIZE - this.width) / 2 + this.width * this.anchor.x;
    }

    getTilePositionY() {
        return Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y;
    }

    die(source) {
        super.die(source);
        Game.map[this.tilePosition.y][this.tilePosition.x].tileType = TILE_TYPE.NONE;
        redrawMiniMapPixel(this.tilePosition.x, this.tilePosition.y);
    }
}