import {Game} from "../../game"
import {Enemy} from "./enemy"
import {DIRECTIONS, ENEMY_TYPE} from "../../enums";
import {getPlayerOnTile, isRelativelyEmpty} from "../../map_checks";
import {createFadingAttack} from "../../animations";
import {TileElement} from "../tile_elements/tile_element";
import * as PIXI from "pixi.js";

export class Star extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/enemies/star.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 2;
        this.health = this.maxHealth;
        this.atk = 1;
        this.triggered = false;
        this.triggeredDirections = null;
        this.type = ENEMY_TYPE.STAR;
        this.turnDelay = 0;
        this.movable = false;
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.triggered) this.attack();
            else {
                if (this.canSeePlayers()) {
                    loop: for (let offset = -2; offset <= 2; offset++) {
                        for (let sign = -1; sign <= 1; sign += 2) {
                            if (offset !== 0) {
                                const player = getPlayerOnTile(this.tilePosition.x + offset, this.tilePosition.y + offset * sign);
                                if (player) {
                                    this.triggered = true;
                                    this.triggeredDirections = DIRECTIONS.DIAGONAL;
                                    break loop;
                                }
                            }
                        }
                    }
                    loop2: for (let x = -1; x <= 1; x++) {
                        for (let y = -1; y <= 1; y++) {
                            if (Math.abs(x) !== Math.abs(y)) {
                                const player = getPlayerOnTile(this.tilePosition.x + x, this.tilePosition.y + y);
                                if (player) {
                                    this.triggered = true;
                                    this.triggeredDirections = DIRECTIONS.CARDINAL;
                                    break loop2;
                                }
                            }
                        }
                    }
                }
                if (this.triggered) this.shake(1, 0);
            }
        } else this.turnDelay--;
    }

    attack() {
        this.triggered = false;
        if (this.triggeredDirections === DIRECTIONS.CARDINAL) {
            this.attackCardinal();
        } else if (this.triggeredDirections === DIRECTIONS.DIAGONAL) {
            this.attackDiagonal();
        }
        this.turnDelay = 1;
    }

    attackCardinal() {
        this.attackTileAtOffset(0, 1);
        this.attackTileAtOffset(1, 0);
        this.attackTileAtOffset(0, -1);
        this.attackTileAtOffset(-1, 0);
    }

    attackDiagonal() {
        this.attackTileAtOffset(-2, -2);
        this.attackTileAtOffset(-1, -1);
        this.attackTileAtOffset(2, 2);
        this.attackTileAtOffset(1, 1);
        this.attackTileAtOffset(-2, 2);
        this.attackTileAtOffset(-1, 1);
        this.attackTileAtOffset(2, -2);
        this.attackTileAtOffset(1, -1);
    }

    attackTileAtOffset(tileOffsetX, tileOffsetY) {
        const attackPositionX = this.tilePosition.x + tileOffsetX;
        const attackPositionY = this.tilePosition.y + tileOffsetY;
        if (isRelativelyEmpty(attackPositionX, attackPositionY)) {
            const attack = new TileElement(PIXI.Texture.WHITE, attackPositionX, attackPositionY);
            attack.tint = 0x888888;
            attack.width = attack.height = Game.TILESIZE * 0.6;
            createFadingAttack(attack);
            const player = getPlayerOnTile(attackPositionX, attackPositionY);
            if (player) player.damage(this.atk, this, false, true);
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.angle = 0;
        if (this.triggered) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/spikes.png"].texture;
            if (this.triggeredDirections === DIRECTIONS.CARDINAL) this.intentIcon.angle = 45;
        } else if (this.turnDelay > 0) {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/hourglass.png"].texture;
        } else {
            this.intentIcon.texture = Game.resources["src/images/icons/intents/eye.png"].texture;
        }
    }
}