import {Game} from "../../game"
import {Enemy} from "./enemy"
import {ENEMY_TYPE, RABBIT_TYPE, ROLE, STAGE} from "../../enums";
import {closestPlayer, tileDistance} from "../../utils/game_utils";
import {getPlayerOnTile, isAnyWall, isInanimate} from "../../map_checks";
import {FullTileElement} from "../tile_elements/full_tile_element";
import {createFadingAttack} from "../../animations";

export class LaserTurret extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/laser_turret.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.atk = 1;
        this.triggered = false;
        this.type = ENEMY_TYPE.LASER_TURRET;
        this.turnDelay = 1;
        this.movable = false;
        this.role = ROLE.WALL_TRAP;
        this.noticeTileDistance = 5;
        this.canMoveInvisible = true;
        this.directionX = 1;
    }

    afterMapGen() {
        if (isAnyWall(this.tilePosition.x + 1, this.tilePosition.y)
            || isInanimate(this.tilePosition.x + 1, this.tilePosition.y)) {
            this.scale.x *= -1;
            this.directionX = -1;
        }
    }

    move() {
        if (!this.visible) {
            if (tileDistance(this, closestPlayer(this)) <= this.noticeTileDistance) {
                this.visible = true;
                if (Game.stage === STAGE.DARK_TUNNEL) {
                    this.maskLayer = {};
                    Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
                }
            }
        } else if (this.triggered) {
            this.attack();
        } else if (this.turnDelay <= 0) {
            for (let x = this.directionX; ; x += this.directionX) {
                if (isAnyWall(this.tilePosition.x + x, this.tilePosition.y)) break;
                const player = getPlayerOnTile(this.tilePosition.x + x, this.tilePosition.y);
                if (player) {
                    this.triggered = true;
                }
            }
        } else this.turnDelay--;
    }

    attack() {
        for (let x = this.directionX; ; x += this.directionX) {
            if (isAnyWall(this.tilePosition.x + x, this.tilePosition.y)) break;
            const attackSprite = new FullTileElement(PIXI.Texture.WHITE, this.tilePosition.x + x, this.tilePosition.y);
            attackSprite.tint = 0xFF0000;
            attackSprite.width = Game.TILESIZE;
            attackSprite.height = Game.TILESIZE / 3;
            if (Game.stage === STAGE.DARK_TUNNEL) attackSprite.maskLayer = {};
            createFadingAttack(attackSprite);
            const player = getPlayerOnTile(this.tilePosition.x + x, this.tilePosition.y);
            if (player) player.damage(this.atk, this, false, true);
        }
    }
}