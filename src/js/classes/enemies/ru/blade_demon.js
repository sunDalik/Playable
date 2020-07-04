import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums";
import {EffectsSpriteSheet, IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {randomAggressiveAI} from "../../../enemy_movement_ai";
import {TileElement} from "../../tile_elements/tile_element";
import {closestPlayer, getAngleForDirection, tileDistance} from "../../../utils/game_utils";
import {Game} from "../../../game";
import {getCardinalDirections, getDiagonalDirections} from "../../../utils/map_utils";
import {getPlayerOnTile, isNotAWall} from "../../../map_checks";
import {randomChoice} from "../../../utils/random_utils";
import {createEnemyAttackTile} from "../../../animations";

export class BladeDemon extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["blade_demon.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 4;
        this.atk = 1.25;
        this.type = ENEMY_TYPE.BLADE_DEMON;
        this.currentTurnDelay = this.turnDelay = 1;
        this.sleepDelay = 2;
        this.currentSleepDelay = 0;
        this.attackPhase = 0; //0 not attacking, 1 about to attack cardinally, 2 about to attack diagonally
        this.noticeDistance = 7;
        this.STEP_ANIMATION_TIME = 7;
        this.shadowInside = true;
        this.setScaleModifier(1.2);
    }

    move() {
        if (this.currentSleepDelay > 0) {
            this.currentSleepDelay--;
        } else if (this.attackPhase === 1) {
            this.attackPhase = 2;
            this.attackCardinally();
            this.shake(randomChoice([-1, 1]), randomChoice([-1, 1]));
        } else if (this.attackPhase === 2) {
            this.attackPhase = 0;
            this.attackDiagonally();
            this.currentSleepDelay = this.sleepDelay;
            this.currentTurnDelay = this.turnDelay;
        } else if (this.currentTurnDelay <= 0 && this.canMelee()) {
            this.melee();
        } else if (this.playersInAttackRange()) {
            this.attackPhase = 1;
            this.shake(1, 0);
        } else if (this.currentTurnDelay <= 0) {
            randomAggressiveAI(this, this.noticeDistance);
            this.currentTurnDelay = this.turnDelay;
        } else this.currentTurnDelay--;
    }

    canMelee() {
        return tileDistance(this, closestPlayer(this)) === 1;
    }

    melee() {
        randomAggressiveAI(this, this.noticeDistance);
        this.currentTurnDelay = this.turnDelay;
    }

    playersInAttackRange() {
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)
                || (getPlayerOnTile(this.tilePosition.x + dir.x * 2, this.tilePosition.y + dir.y * 2)
                    && isNotAWall(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y))) {
                return true;
            }
        }
        return false;
    }

    attackCardinally() {
        for (const dir of getCardinalDirections()) {
            this.attackTileAtOffset(dir.x, dir.y);
            this.attackTileAtOffset(dir.x * 2, dir.y * 2);
            this.createAttackAnimation(dir.x * 2, dir.y * 2);
        }
    }

    attackDiagonally() {
        for (const dir of getDiagonalDirections()) {
            this.attackTileAtOffset(dir.x, dir.y);
            this.attackTileAtOffset(dir.x * 2, dir.y * 2);
            this.createAttackAnimation(dir.x * 2, dir.y * 2);
        }
    }

    attackTileAtOffset(tileOffsetX, tileOffsetY) {
        const attackPosition = {x: this.tilePosition.x + tileOffsetX, y: this.tilePosition.y + tileOffsetY};

        const player = getPlayerOnTile(attackPosition.x, attackPosition.y);
        if (player) player.damage(this.atk, this, false, true);

        createEnemyAttackTile(attackPosition, 16, 0.3);
    }

    //I dunno I just mostly copied it from spike animation
    createAttackAnimation(offsetX, offsetY) {
        this.texture = RUEnemiesSpriteSheet["blade_demon_no_hands.png"];
        const spike = new TileElement(EffectsSpriteSheet["spike.png"], this.tilePosition.x, this.tilePosition.y);
        const sword = new TileElement(RUEnemiesSpriteSheet["blade_demon_sword.png"], this.tilePosition.x, this.tilePosition.y);
        spike.tint = 0xd35941;
        spike.position.set(this.getTilePositionX(), this.getTilePositionY());
        sword.position.set(spike.position.x + Math.sign(offsetX) * sword.width / 2, spike.position.y + Math.sign(offsetY) * sword.height / 2);
        spike.zIndex = this.zIndex + 1;
        sword.zIndex = spike.zIndex - 1;
        spike.anchor.set(0, 0.5);
        spike.angle = getAngleForDirection({x: offsetX, y: offsetY});
        sword.angle = spike.angle + 135;
        Game.world.addChild(spike);
        Game.world.addChild(sword);
        const animationTime = 10;
        const sizeMod = Math.sqrt(offsetX ** 2 + offsetY ** 2);
        const widthStep = Game.TILESIZE * sizeMod / (animationTime / 2);
        const initSwordPosition = {x: sword.position.x, y: sword.position.y};
        const swordXStep = offsetY !== 0 ? Math.sign(offsetX) * widthStep / 2 : Math.sign(offsetX) * widthStep;
        const swordYStep = offsetX !== 0 ? Math.sign(offsetY) * widthStep / 2 : Math.sign(offsetY) * widthStep;
        spike.width = 1;
        const delay = 6;
        let counter = 0;

        const animation = (delta) => {
            if (Game.paused) return;
            counter += delta;
            if (counter < animationTime / 2) {
                spike.width += widthStep;
                sword.position.x += swordXStep;
                sword.position.y += swordYStep;
            } else if (counter < animationTime / 2 + delay) {
                spike.width = widthStep * animationTime / 2;
                sword.position.set(initSwordPosition.x + swordXStep * animationTime / 2, initSwordPosition.y + swordYStep * animationTime / 2);
            } else if (counter >= animationTime / 2 + delay) {
                spike.width -= widthStep;
                sword.position.x -= swordXStep;
                sword.position.y -= swordYStep;
                if (spike.width <= 0) spike.width = 1;
            }
            if (counter >= animationTime + delay) {
                this.texture = RUEnemiesSpriteSheet["blade_demon.png"];
                Game.app.ticker.remove(animation);
                Game.world.removeChild(spike);
                Game.world.removeChild(sword);
                spike.destroy();
                sword.destroy();
            }
        };
        Game.app.ticker.add(animation);
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.angle = 0;
        if (this.currentSleepDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else if (this.attackPhase === 1) {
            this.intentIcon.texture = IntentsSpriteSheet["spikes.png"];
            this.intentIcon.angle = 45;
        } else if (this.attackPhase === 2) {
            this.intentIcon.texture = IntentsSpriteSheet["spikes.png"];
        } else if (this.currentTurnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["eye.png"];
        } else if (tileDistance(this, closestPlayer(this)) <= this.noticeDistance) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }

}