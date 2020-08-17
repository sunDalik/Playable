import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE, ROLE, TILE_TYPE} from "../../../enums/enums";
import {getPlayerOnTile, isNotAWall} from "../../../map_checks";
import {randomChoice} from "../../../utils/random_utils";
import {getCardinalDirections} from "../../../utils/map_utils";
import {TileElement} from "../../tile_elements/tile_element";
import {DCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {wallTallness} from "../../draw/wall";
import {Z_INDEXES} from "../../../z_indexing";
import {redrawMiniMapPixel} from "../../../drawing/minimap";

export class CactusWallTrap extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["cactus_wall_trap.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 1;
        this.name = "Cactus Wall Trap";
        this.atk = 1;
        this.triggered = false;
        this.type = ENEMY_TYPE.CACTUS_WALL_TRAP;
        this.turnDelay = 4;
        this.currentTurnDelay = 0;
        this.movable = false;
        this.role = ROLE.WALL_TRAP;
        this.generateSpikes();
        this.correctZIndex();
        this.removeShadow();
        this.setScaleModifier(1.02); //wall scale modifier
        this.scale.x *= randomChoice([-1, 1]);
    }

    generateSpikes() {
        this.spikes = [];
        for (const dir of getCardinalDirections()) {
            const spike = new TileElement(DCEnemiesSpriteSheet["cactus_spikes_right.png"], this.tilePosition.x + dir.x, this.tilePosition.y + dir.y, true);
            Game.world.addChild(spike);
            spike.visible = false;
            spike.position.y -= wallTallness / 2;
            if (dir.x === -1) {
                spike.scale.x = -Math.abs(spike.scale.x);
            } else if (dir.y !== 0) {
                spike.texture = DCEnemiesSpriteSheet["cactus_spikes_up.png"];
                spike.setScaleModifier(1.15);
                if (dir.y === 1) spike.scale.y = -Math.abs(spike.scale.y);
            }
            spike.setOwnZIndex(Z_INDEXES.PLAYER_PRIMARY + 1);
            this.spikes.push(spike);
        }
    }

    revive() {
        return false;
    }

    move() {
        for (const spike of this.spikes) spike.visible = false;
        if (this.triggered) {
            this.triggered = false;
            this.currentTurnDelay = this.turnDelay;
            this.attack();
        } else if (this.currentTurnDelay <= 0) {
            if (this.canBeTriggered()) {
                this.triggered = true;
                this.updateTexture();
                this.shake(randomChoice([-1, 1]), 0);
            }
        } else {
            this.currentTurnDelay--;
            this.updateTexture();
        }
    }

    canBeTriggered() {
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) !== null) return true;
            if (isNotAWall(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                for (const dir2 of getCardinalDirections()) {
                    if (getPlayerOnTile(this.tilePosition.x + dir.x + dir2.x, this.tilePosition.y + dir.y + dir2.y) !== null) return true;
                }
            }
        }
        return false;
    }

    attack() {
        for (const dir of getCardinalDirections()) {
            const player = getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
            if (player) player.damage(this.atk, this, false, true);
        }
        for (const spike of this.spikes) {
            if (isNotAWall(spike.tilePosition.x, spike.tilePosition.y)) {
                spike.visible = true;
            }
        }
        this.updateTexture();
    }

    updateTexture() {
        if (this.triggered) {
            this.texture = DCEnemiesSpriteSheet["cactus_wall_trap_triggered.png"];
        } else if (this.currentTurnDelay > 0) {
            this.texture = DCEnemiesSpriteSheet["cactus_wall_trap_attacked.png"];
        } else {
            this.texture = DCEnemiesSpriteSheet["cactus_wall_trap.png"];
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.angle = 0;
        if (this.triggered) {
            this.intentIcon.texture = IntentsSpriteSheet["spikes.png"];
            this.intentIcon.angle = 45;
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
        // +1 because it's off by 1 pixel for some reason idk
        return Game.TILESIZE * this.tilePosition.y - Game.TILESIZE + (Game.TILESIZE * 2 - this.height) + this.height * this.anchor.y + 1;
    }

    die(source) {
        super.die(source);
        for (const spike of this.spikes) spike.visible = false;
        Game.map[this.tilePosition.y][this.tilePosition.x].tileType = TILE_TYPE.NONE;
        redrawMiniMapPixel(this.tilePosition.x, this.tilePosition.y);
    }
}