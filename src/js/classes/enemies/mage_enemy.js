import {Enemy} from "./enemy";
import * as PIXI from "pixi.js";
import {IntentsSpriteSheet} from "../../loader";
import {closestPlayer, tileDistance} from "../../utils/game_utils";
import {randomAfraidAI} from "../../enemy_movement_ai";

//abstract
export class MageEnemy extends Enemy {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 3;
        this.atk = 0;
        this.SLIDE_ANIMATION_TIME = 5;
        this.turnDelay = 2;
        this.currentTurnDelay = this.turnDelay;
        this.casting = false;
        this.cooldown = 14;
        this.currentCooldown = Math.floor(this.cooldown / 3);
        this.castDistance = 7;
        this.dangerDistance = 3;
        this.castTime = 2;
        this.currentCastTime = this.castTime;
        this.setScaleModifier(1.1);

        // you must specify these
        this.neutralTexture = PIXI.Texture.WHITE;
        this.preparingTexture = PIXI.Texture.WHITE;
        this.castingTexture = PIXI.Texture.WHITE;
    }

    setStun(stun) {
        super.setStun(stun);
        this.casting = false;
        this.texture = this.neutralTexture;
    }

    move() {
        this.correctScale();
        if (this.casting) {
            this.currentCooldown = this.cooldown;
            this.currentCastTime--;
            if (this.currentCastTime === 1) this.texture = this.castingTexture;
            else if (this.currentCastTime <= 0) {
                this.casting = false;
                this.currentTurnDelay = this.turnDelay;
                this.texture = this.neutralTexture;
                this.cast();
            }
        } else if (this.currentCooldown <= 0 && tileDistance(this, closestPlayer(this)) <= this.castDistance && this.canCast()) {
            this.casting = true;
            this.currentCastTime = this.castTime;
            this.texture = this.preparingTexture;
            this.prepare();
        } else if (this.currentTurnDelay <= 0) {
            randomAfraidAI(this, this.dangerDistance, false, true);
        } else {
            this.currentTurnDelay--;
        }
        this.currentCooldown--;
    }

    cast() {
    }

    canCast() {
        return true;
    }

    prepare() {
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.filters = [];
        if (this.casting) {
            if (this.currentCastTime === 1) {
                this.intentIcon.texture = IntentsSpriteSheet["magic.png"];
            } else {
                this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
            }
        } else if (this.currentTurnDelay <= 0) {
            if (tileDistance(this, closestPlayer(this)) <= this.dangerDistance) {
                this.intentIcon.texture = IntentsSpriteSheet["fear.png"];
            } else {
                this.intentIcon.texture = IntentsSpriteSheet["neutral.png"];
            }
        } else {
            this.intentIcon.texture = IntentsSpriteSheet["hourglass.png"];
        }
    }

    correctScale() {
        const sign = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
        if (sign !== 0) {
            this.scale.x = sign * Math.abs(this.scale.x);
        }
    }
}