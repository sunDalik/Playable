import {Enemy} from "../enemy";
import {ENEMY_TYPE} from "../../../enums";
import {EffectsSpriteSheet, IntentsSpriteSheet, RUEnemiesSpriteSheet} from "../../../loader";
import {randomAggressiveAI} from "../../../enemy_movement_ai";
import {TileElement} from "../../tile_elements/tile_element";
import {closestPlayer, getAngleForDirection, tileDistance} from "../../../utils/game_utils";
import {Game} from "../../../game";
import {getCardinalDirections} from "../../../utils/map_utils";
import {getPlayerOnTile} from "../../../map_checks";
import {randomChoice} from "../../../utils/random_utils";

export class BladeDemon extends Enemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["blade_demon.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 3;
        this.type = ENEMY_TYPE.BLADE_DEMON;
        this.currentTurnDelay = this.turnDelay = 1;
        this.afterAttackTurnDelay = 2;
        this.attackPhase = 0; //0 not attacking, 1 about to attack cardinally, 2 about to attack diagonally
        this.noticeDistance = 7;
        this.STEP_ANIMATION_TIME = 7;
        this.shadowInside = true;
        this.setScaleModifier(1.2);
    }

    move() {
        if (this.attackPhase === 1) {
            this.attackPhase = 2;
            this.attackCardinally();
            this.shake(randomChoice([-1, 1]), randomChoice([-1, 1]));
        } else if (this.attackPhase === 2) {
            this.attackPhase = 0;
            this.attackDiagonally();
            this.currentTurnDelay = this.afterAttackTurnDelay;
        } else if (this.playersInAttackRange()) {
            this.attackPhase = 1;
            this.shake(1, 0);
        } else if (this.currentTurnDelay <= 0) {
            randomAggressiveAI(this, this.noticeDistance);
            this.currentTurnDelay = this.turnDelay;
        } else this.currentTurnDelay--;
    }

    playersInAttackRange() {
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)
                || getPlayerOnTile(this.tilePosition.x + dir.x * 2, this.tilePosition.y + dir.y * 2)) {
                return true;
            }
        }
        return false;
    }

    attackCardinally() {

    }

    attackDiagonally() {

    }

    createAttackAnimation(offsetX, offsetY) {
        const attack = new TileElement(EffectsSpriteSheet["spike.png"], origin.tilePosition.x, origin.tilePosition.y);
        attack.tint = 0xd35941;
        attack.position.set(origin.getTilePositionX(), origin.getTilePositionY());
        attack.zIndex = zIndex;
        attack.anchor.set(0, 0.5);
        attack.angle = getAngleForDirection({x: offsetX, y: offsetY});
        Game.world.addChild(attack);
        const animationTime = 10;
        const pythagorSideMul = Math.max(Math.abs(offsetX), Math.abs(offsetY)) === 2 ? 1.25 : 1.5;
        const sizeMod = Math.sqrt((pythagorSideMul * Math.abs(offsetX)) ** 2 + (pythagorSideMul * Math.abs(offsetY)) ** 2);
        const widthStep = attack.width * sizeMod / (animationTime / 2);
        attack.width = 1;
        const delay = 6;
        let counter = 0;

        const animation = (delta) => {
            if (Game.paused) return;
            counter += delta;
            if (counter < animationTime / 2) {
                attack.width += widthStep;
            } else if (counter < animationTime / 2 + delay) {
                attack.width = widthStep * animationTime / 2;
            } else if (counter >= animationTime / 2 + delay) {
                attack.width -= widthStep;
                if (attack.width <= 0) attack.width = 1;
            }
            if (counter >= animationTime + delay) {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(attack);
                attack.destroy();
            }
        };
        Game.app.ticker.add(animation);
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.angle = 0;
        if (this.attackPhase === 1) {
            this.intentIcon.texture = IntentsSpriteSheet["spikes.png"];
            this.intentIcon.angle = 45;
        } else if (this.attackPhase === 2) {
            this.intentIcon.texture = IntentsSpriteSheet["spikes.png"];
        } else if (this.currentTurnDelay > 0) {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        } else if (tileDistance(this, closestPlayer(this)) <= this.noticeDistance) {
            this.intentIcon.texture = IntentsSpriteSheet["anger.png"];
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
        }
    }

}