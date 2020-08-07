import {Game} from "../../game";
import {Hazard} from "./hazard";
import {HAZARD_TYPE} from "../../enums/enums";
import {randomFloat, randomInt} from "../../utils/random_utils";
import * as PIXI from "pixi.js";
import {removeObjectFromArray} from "../../utils/basic_utils";
import {EffectsSpriteSheet} from "../../loader";

export class PoisonHazard extends Hazard {
    constructor(tilePositionX, tilePositionY, startAt0Atk = false, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY);
        this.LIFETIME = 10;
        this.name = "Poison Hazard";
        this.turnsLeft = this.LIFETIME;
        this.type = HAZARD_TYPE.POISON;
        this.actualAtk = 0.5;
        if (startAt0Atk) this.atk = 0;
        else this.atk = 0.5;
        this.dead = false;

        this.particleTexture = EffectsSpriteSheet["poison_bubble.png"];
        this.staticColor = 0x0052a7;
        this.colorConstraints = {min: 0x6a0000, max: 0x840000};
        this.tint = 0x7752a7;
    }

    turnToDark() {
        if (this.type === HAZARD_TYPE.POISON) {
            const clone = this.darkClone();
            this.removeFromWorld();
            clone.addToWorld();
            clone.turnsLeft += 3;
        }
    }

    darkClone() {
        const darkClone = new DarkPoisonHazard(this.tilePosition.x, this.tilePosition.y, false);
        darkClone.atk = this.atk;
        darkClone.turnsLeft = this.turnsLeft;
        darkClone.dead = this.dead;
        return darkClone;
    }

    updateLifetime() {
        if (this.atk === 0) this.atk = this.actualAtk;
        return super.updateLifetime();
    }

    addToWorld() {
        super.addToWorld();
        if (!this.animation) {
            this.initParticles();
            this.setUpOwnAnimation();
        }
    }

    removeFromWorld() {
        super.removeFromWorld();
        this.dead = true;
        if (this.animation) Game.world.addChild(this);
    }

    initParticles() {
        this.particles = [];
        const particlesAmount = 9;
        const rows = Math.floor(Math.sqrt(particlesAmount)); // = cols
        for (let i = 0; i < particlesAmount; i++) {
            const row = Math.floor(i / rows);
            const col = i % rows;
            const particle = new PIXI.Sprite(this.particleTexture);
            particle.zIndex = this.zIndex + 1;
            Game.world.addChild(particle);
            const gridOffset = this.width / rows * 0.3;
            particle.setRandomPosition = () => {
                particle.position.set(
                    randomInt((this.position.x - this.width / 2) + col * this.width / rows + gridOffset, (this.position.x - this.width / 2) + (col + 1) * this.width / rows - gridOffset),
                    randomInt((this.position.y - this.height / 2) + row * this.height / rows + gridOffset, (this.position.y - this.height / 2) + (row + 1) * this.height / rows - gridOffset));
            };

            let counter = 0;
            let init = true;
            let poppedPhase = false;
            let animationTime = 0;
            const maxScaleStep = 0.005;
            const scaleMod = {
                min: 0.25 * Game.TILESIZE / particle.width + maxScaleStep,
                max: 0.40 * Game.TILESIZE / particle.width - maxScaleStep
            };
            if (Math.random() < 0.25) {
                poppedPhase = true;
                particle.scale.x = particle.scale.y = 0;
                animationTime = randomInt(15, 55);
            }
            const initAnimationTime = randomInt(9, 13);
            let chosenScaleMod = randomFloat(scaleMod.min, scaleMod.max);
            let beforeDeadScale = 1;
            let lastScaleStepSign = 1;
            particle.anchor.set(0.5, 0.8);
            particle.setRandomPosition();
            particle.scale.x = particle.scale.y = 0;
            const animation = delta => {
                if (Game.paused) return;
                counter += delta;
                if (this.dead) {
                    particle.scale.x = particle.scale.y = Math.max(particle.scale.x - delta / initAnimationTime * beforeDeadScale, 0);
                } else if (poppedPhase) {
                    if (counter >= animationTime) {
                        particle.setRandomPosition();
                        poppedPhase = false;
                        init = true;
                        counter = 0;
                        animationTime = randomInt(20, 80);
                    }
                } else if (init) {
                    beforeDeadScale = particle.scale.x = particle.scale.y = (counter / (initAnimationTime)) * chosenScaleMod;
                    if (counter >= initAnimationTime) {
                        counter = 0;
                        init = false;
                        beforeDeadScale = particle.scale.x = particle.scale.y = chosenScaleMod;
                    }
                } else {
                    let scaleStep = randomFloat(-maxScaleStep, maxScaleStep);
                    if (Math.random() < 0.8) scaleStep = Math.abs(scaleStep) * lastScaleStepSign;
                    if (particle.scale.x + scaleStep > scaleMod.max) scaleStep = -Math.abs(scaleStep);
                    else if (particle.scale.x + scaleStep < scaleMod.min) scaleStep = Math.abs(scaleStep);
                    particle.scale.x = particle.scale.y = particle.scale.x + scaleStep;
                    beforeDeadScale = particle.scale.x;
                    lastScaleStepSign = Math.sign(scaleStep);
                    if (counter >= animationTime) {
                        if (animationTime > 0) {
                            particle.scale.x = particle.scale.y = 0;
                            poppedPhase = true;
                            counter = 0;
                        }
                        animationTime = randomInt(15, 55);
                    }
                }
            };
            Game.infiniteAnimations.push(animation);
            Game.app.ticker.add(animation);
            particle.animation = animation;
            this.particles.push(particle);
        }
    }

    setUpOwnAnimation() {
        let counter = 0;
        let init = true;
        this.tint = this.staticColor + randomInt(this.colorConstraints.min / 0x10000, this.colorConstraints.max / 0x10000) * 0x10000;
        const initAnimationTime = randomInt(5, 9);
        this.alpha = 0;
        const animation = delta => {
            if (Game.paused) return;
            if (this.dead) {
                this.alpha -= delta / initAnimationTime;
                if (this.alpha < 0) this.purge();
            } else if (init) {
                counter += delta;
                this.alpha = counter / initAnimationTime;
                if (counter >= initAnimationTime) {
                    counter = 0;
                    init = false;
                    this.alpha = 1;
                }
            } else {
                if (Math.random() < 0.5) return;
                let colorStep = randomInt(-2, 2) * 0x10000;
                const topTint = this.tint - this.staticColor;
                if (topTint + colorStep > this.colorConstraints.max) colorStep = -Math.abs(colorStep);
                else if (topTint + colorStep < this.colorConstraints.min) colorStep = Math.abs(colorStep);
                this.tint += colorStep;
            }
        };
        Game.infiniteAnimations.push(animation);
        Game.app.ticker.add(animation);
        this.animation = animation;
    }

    purge() {
        if (this.particles) {
            for (const particle of this.particles) {
                Game.world.removeChild(particle);
                particle.destroy();
                Game.app.ticker.remove(particle.animation);
                removeObjectFromArray(particle.animation, Game.infiniteAnimations);
            }
        }
        if (this.animation) {
            Game.app.ticker.remove(this.animation);
            removeObjectFromArray(this.animation, Game.infiniteAnimations);
        }
        this.purged = true;
    }
}

export class DarkPoisonHazard extends PoisonHazard {
    constructor(tilePositionX, tilePositionY, startAt0Atk = false, texture = PIXI.Texture.WHITE) {
        super(tilePositionX, tilePositionY, startAt0Atk, texture);
        this.turnsLeft = this.LIFETIME = 11;
        this.type = HAZARD_TYPE.DARK_POISON;
        this.dark = true;
        this.particleTexture = EffectsSpriteSheet["dark_poison_bubble.png"];
        this.staticColor = 0x00377d;
        this.colorConstraints = {min: 0x160000, max: 0x410000};
    }
}