import {Game} from "../../../game";
import {Enemy} from "../enemy";
import {ENEMY_TYPE, ROLE, TILE_TYPE} from "../../../enums/enums";
import {getPlayerOnTile} from "../../../map_checks";
import {randomChoice} from "../../../utils/random_utils";
import {getCardinalDirectionsWithNoWallsOrInanimates} from "../../../utils/map_utils";
import {TileElement} from "../../tile_elements/tile_element";
import {FCEnemiesSpriteSheet, IntentsSpriteSheet} from "../../../loader";
import {runDestroyAnimation} from "../../../animations";
import {WallTrapBase} from "../../draw/wall_trap_base";
import {wallTallness} from "../../draw/wall";
import {getZIndexForLayer, Z_INDEXES} from "../../../z_indexing";
import {getAngleForDirection} from "../../../utils/game_utils";
import {redrawMiniMapPixel} from "../../../drawing/minimap";

export class SpikyWallTrap extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = FCEnemiesSpriteSheet["spiky_wall_trap_x.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 1;
        this.name = "Spiky Wall Trap";
        this.atk = 1;
        this.triggered = false;
        this.type = ENEMY_TYPE.SPIKY_WALL_TRAP;
        this.turnDelay = 4;
        this.currentTurnDelay = 1;
        this.movable = false;
        this.role = ROLE.WALL_TRAP;
        this.direction = {x: 1, y: 0};
        this.spikesSprite = new TileElement(FCEnemiesSpriteSheet["spiky_wall_trap_spikes_right.png"], 0, 0, true);
        this.spikesSprite.visible = false;
        Game.world.addChild(this.spikesSprite);
        this.intentIcon2 = this.createIntentIcon();
        this.intentIcon2.alpha = 0.8;
        this.intentIcon2.width = this.intentIcon2.height = 15;
        this.wallBase = new WallTrapBase(this.tilePosition.x, this.tilePosition.y);
        Game.world.addChild(this.wallBase);
        this.correctZIndex();
        this.wallBase.zIndex = getZIndexForLayer(this.tilePosition.y, true);
        this.removeShadow();
        this.setCenterPreservation();
    }

    afterMapGen() {
        const directions = getCardinalDirectionsWithNoWallsOrInanimates(this);
        if (directions.length === 0) this.die(null);
        else this.direction = randomChoice(directions);

        if (this.direction.x === -1) {
            this.spikesSprite.scale.x = -Math.abs(this.spikesSprite.scale.x);
        } else if (this.direction.y !== 0) {
            this.spikesSprite.texture = FCEnemiesSpriteSheet["spiky_wall_trap_spikes_up.png"];
            this.spikesSprite.setScaleModifier(1.15);
            if (this.direction.y === 1) this.spikesSprite.scale.y = -Math.abs(this.spikesSprite.scale.y);
        }

        this.spikesSprite.tilePosition.x = this.tilePosition.x + this.direction.x;
        this.spikesSprite.tilePosition.y = this.tilePosition.y + this.direction.y;
        this.spikesSprite.place();
        this.spikesSprite.position.y -= wallTallness / 2;
        this.spikesSprite.setOwnZIndex(Z_INDEXES.PLAYER_PRIMARY + 1);
        this.updateTexture();
    }

    revive() {
        return false;
    }

    place() {
        super.place();
        this.position.y -= wallTallness;
        if (this.intentIcon2) {
            this.intentIcon.position.y -= wallTallness;
            this.intentIcon2.position.y -= wallTallness;
        }
    }

    move() {
        this.spikesSprite.visible = false;
        if (this.triggered) {
            this.triggered = false;
            this.currentTurnDelay = this.turnDelay;
            this.attack();
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
        if (player) player.damage(this.atk, this, false, true);
        this.spikesSprite.visible = true;
        this.updateTexture();
    }

    updateTexture() {
        if (this.direction.x !== 0) this.scale.x = Math.abs(this.scale.x) * this.direction.x;

        if (this.triggered) {
            this.texture = FCEnemiesSpriteSheet["spiky_wall_trap_triggered.png"];
        } else if (this.currentTurnDelay > 0) {
            this.texture = FCEnemiesSpriteSheet["spiky_wall_trap_attacked.png"];
        } else {
            if (this.direction.x !== 0) this.texture = FCEnemiesSpriteSheet["spiky_wall_trap_x.png"];
            else if (this.direction.y === -1) this.texture = FCEnemiesSpriteSheet["spiky_wall_trap_top.png"];
            else this.texture = FCEnemiesSpriteSheet["spiky_wall_trap_bottom.png"];
        }
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon2.visible = false;
        if (this.triggered) {
            this.intentIcon.texture = IntentsSpriteSheet["spikes.png"];
            this.intentIcon2.texture = IntentsSpriteSheet["arrow_right.png"];
            this.intentIcon2.angle = getAngleForDirection(this.direction);
            this.intentIcon2.visible = true;
        } else if (this.currentTurnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["eye.png"];
        }
    }

    //doesnt die properly sometimes? (wallbase isnt removed)
    //wall destruction animation is weird
    die(source) {
        super.die(source);
        this.spikesSprite.visible = false;
        runDestroyAnimation(this.wallBase);
        this.wallBase.visible = false;
        Game.map[this.tilePosition.y][this.tilePosition.x].tileType = TILE_TYPE.NONE;
        redrawMiniMapPixel(this.tilePosition.x, this.tilePosition.y);
    }
}