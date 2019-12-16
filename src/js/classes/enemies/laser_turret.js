import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {Enemy} from "./enemy";
import {ENEMY_TYPE, ROLE, STAGE} from "../../enums";
import {closestPlayer, tileDistance} from "../../utils/game_utils";
import {getPlayerOnTile, isAnyWall, isInanimate} from "../../map_checks";
import {FullTileElement} from "../tile_elements/full_tile_element";
import {createFadingAttack} from "../../animations";

export class LaserTurret extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/laser_turret_0.png"].texture) {
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
        this.scaleModifier = 1;
        this.fitToTile();
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
            const attackSprite = new FullTileElement(PIXI.Texture.WHITE, this.tilePosition.x + x, this.tilePosition.y);
            attackSprite.zIndex = 4;
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
        if (this.maskLayer === undefined) {
            this.texture = Game.resources["src/images/enemies/laser_turret_0.png"].texture;
        } else if (this.justAttacked) {
            this.texture = Game.resources["src/images/enemies/laser_turret_after_attack.png"].texture;
            this.justAttacked = false;
        } else if (this.triggered) {
            this.texture = Game.resources["src/images/enemies/laser_turret_triggered.png"].texture;
        } else if (this.currentTurnDelay > 0) {
            this.texture = Game.resources["src/images/enemies/laser_turret_unready.png"].texture;
        } else {
            this.texture = Game.resources["src/images/enemies/laser_turret_awake.png"].texture;
        }
    }
}