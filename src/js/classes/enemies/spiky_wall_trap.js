import {Game} from "../../game";
import {Enemy} from "./enemy";
import {ENEMY_TYPE, ROLE} from "../../enums";
import {getPlayerOnTile} from "../../map_checks";
import {randomChoice} from "../../utils/random_utils";
import {getCardinalDirectionsWithNoWallsOrInanimates} from "../../utils/map_utils";

export class SpikyWallTrap extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/spiky_wall_trap_x.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.atk = 1;
        this.triggered = false;
        this.type = ENEMY_TYPE.SPIKY_WALL_TRAP;
        this.turnDelay = 4;
        this.currentTurnDelay = 0;
        this.movable = false;
        this.role = ROLE.WALL_TRAP;
        this.direction = {x: 1, y: 0};
        this.zIndex = Game.primaryPlayer.zIndex + 1;
    }

    afterMapGen() {
        const directions = getCardinalDirectionsWithNoWallsOrInanimates(this);
        if (directions.length === 0) this.die(null);
        else this.direction = randomChoice(directions);
        this.fitToTile();
        this.updateTexture();
        this.place();
    }

    fitToTile() {
        let scaleX, scaleY;
        if (this.getUnscaledHeight() < this.getUnscaledWidth()) {
            scaleY = Game.TILESIZE / this.getUnscaledHeight();
            scaleX = Math.abs(scaleY);
        } else {
            scaleX = Game.TILESIZE / this.getUnscaledWidth();
            scaleY = Math.abs(scaleX);
        }
        this.scale.set(scaleX, scaleY);
    }

    place() {
        super.place();
        if (!this.direction) return;
        this.position.x += this.width / 4 * this.direction.x;
        this.position.y += this.height / 4 * this.direction.y;
    }

    move() {
        if (this.triggered) {
            this.attack();
            this.triggered = false;
            this.currentTurnDelay = this.turnDelay;
        } else if (this.currentTurnDelay <= 0) {
            let triggerDirs;
            if (this.direction.x !== 0) {
                triggerDirs = [{x: this.direction.x, y: 0},
                    {x: this.direction.x, y: -1},
                    {x: this.direction.x, y: 1},
                    {x: this.direction.x * 2, y: 0}];
            } else if (this.direction.y !== 0) {
                triggerDirs = [{x: 0, y: this.direction.y},
                    {x: -1, y: this.direction.y},
                    {x: 1, y: this.direction.y},
                    {x: 0, y: this.direction.y * 2}];
            }
            for (const dir of triggerDirs) {
                const player = getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
                if (player) {
                    this.triggered = true;
                    this.updateTexture();
                    this.shake(this.direction.x * 1.1, this.direction.y * 1.1);
                    break;
                }
            }
        } else {
            this.currentTurnDelay--;
            this.updateTexture();
        }
    }

    attack() {
        const player = getPlayerOnTile(this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y);
        if (player) {
            player.damage(this.atk, this, false, true);
        }
        this.justAttacked = true;
        this.updateTexture();
    }

    updateTexture() {
        if (this.direction.x !== 0) this.scale.x = Math.abs(this.scale.x) * this.direction.x;

        if (this.justAttacked) {
            if (this.direction.x !== 0) this.texture = Game.resources["src/images/enemies/spiky_wall_trap_x_attacked.png"].texture;
            else if (this.direction.y === -1) this.texture = Game.resources["src/images/enemies/spiky_wall_trap_top_attacked.png"].texture;
            else this.texture = Game.resources["src/images/enemies/spiky_wall_trap_bottom_attacked.png"].texture;
            this.justAttacked = false;
        } else if (this.triggered) {
            if (this.direction.x !== 0) this.texture = Game.resources["src/images/enemies/spiky_wall_trap_x_triggered.png"].texture;
            else if (this.direction.y === -1) this.texture = Game.resources["src/images/enemies/spiky_wall_trap_top_triggered.png"].texture;
            else this.texture = Game.resources["src/images/enemies/spiky_wall_trap_bottom_triggered.png"].texture;
        } else if (this.currentTurnDelay > 0) {
            if (this.direction.x !== 0) this.texture = Game.resources["src/images/enemies/spiky_wall_trap_x_unready.png"].texture;
            else if (this.direction.y === -1) this.texture = Game.resources["src/images/enemies/spiky_wall_trap_top_unready.png"].texture;
            else this.texture = Game.resources["src/images/enemies/spiky_wall_trap_bottom_unready.png"].texture;
        } else {
            if (this.direction.x !== 0) this.texture = Game.resources["src/images/enemies/spiky_wall_trap_x.png"].texture;
            else if (this.direction.y === -1) this.texture = Game.resources["src/images/enemies/spiky_wall_trap_top.png"].texture;
            else this.texture = Game.resources["src/images/enemies/spiky_wall_trap_bottom.png"].texture;
        }
    }
}