import {Game} from "../../game";
import {Hazard} from "./hazard";
import {HAZARD_TYPE, STAGE} from "../../enums";
import {get8Directions, getCardinalDirections} from "../../utils/map_utils";
import {isNotAWall} from "../../map_checks";
import {randomFloat, randomInt, randomShuffle} from "../../utils/random_utils";
import {removeObjectFromArray} from "../../utils/basic_utils";
import * as PIXI from "pixi.js";
import {EffectsSpriteSheet} from "../../loader";

export class FireHazard extends Hazard {
    constructor(tilePositionX, tilePositionY, small = false, spreadTimes = undefined, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY);
        this.LIFETIME = 14;
        this.actualAtk = 0.5;
        this.small = small;
        this.subFire = small;
        this.maxSpreadTimes = 3;
        if (spreadTimes !== undefined) this.spreadTimes = spreadTimes;
        else this.spreadTimes = this.maxSpreadTimes;
        this.spreadDelay = 1;
        this.currentSpreadDelay = this.spreadDelay;
        if (this.small) {
            this.tileSpread = 1;
            this.atk = 0;
        } else {
            this.tileSpread = 5;
            this.atk = this.actualAtk;
        }
        this.turnsLeft = this.LIFETIME;
        this.type = HAZARD_TYPE.FIRE;
        this.dark = false;
        this.dead = false;

        this.particleTexture = EffectsSpriteSheet["fire_effect.png"];
        this.particleSmallTexture = EffectsSpriteSheet["fire_effect_small.png"];
        this.staticColor = 0xd60043;
        this.colorConstraints = {min: 0x006800, max: 0x00a000};
        this.tint = 0xd67443;
    }

    addToWorld() {
        super.addToWorld();
        if (!this.animation) this.startAnimation();

        // hmmm why do we not define maskLayer in the constructor?...
        if (Game.stage === STAGE.DARK_TUNNEL) {
            this.maskLayer = {};
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
        }
    }

    startAnimation() {
        this.initParticles();
        this.setUpOwnAnimation();
    }

    removeFromWorld() {
        super.removeFromWorld();
        this.dead = true;
        if (this.animation) Game.world.addChild(this);
        if (this.maskLayer && Game.stage === STAGE.DARK_TUNNEL) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        }
    }

    updateLifetime() {
        if (super.updateLifetime()) {
            if (this.small && this.turnsLeft > 0) {
                this.small = false;
                this.atk = this.actualAtk;
            } else if (!this.small && this.spreadTimes > 0 && this.currentSpreadDelay <= 0) {
                let spreadCounter = this.tileSpread;
                let directionsArray;
                if (!this.subFire) directionsArray = this.getDirectionsWithNoHazardsOfType(false);
                else {
                    if (Math.random() < 0.8) directionsArray = this.getDirectionsWithNoHazardsOfType(true);
                    else directionsArray = this.getDirectionsWithNoHazardsOfType(false);
                }
                for (const dir of randomShuffle(directionsArray)) {
                    if (spreadCounter <= 0) break;
                    if (isNotAWall(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                        const newHazard = new this.constructor(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y, true, this.spreadTimes - 1);
                        Game.world.addHazard(newHazard);
                        newHazard.LIFETIME = newHazard.turnsLeft = this.LIFETIME;
                    }
                    spreadCounter--;
                }
                this.currentSpreadDelay = this.spreadDelay;
                this.spreadTimes = 0;
            } else if (this.currentSpreadDelay > 0) {
                this.currentSpreadDelay--;
            }
        }
    }

    extinguish() {
        this.small = true;
        this.atk = 0;
        this.spreadTimes = 0;
        this.turnsLeft = 1;
    }

    ignite() {
        this.spreadTimes++;
        this.turnsLeft += 3;
        if (this.spreadTimes > this.maxSpreadTimes) this.spreadTimes = this.maxSpreadTimes;
    }

    getDirectionsWithNoHazardsOfType(cardinalsOnly = false) {
        let directions = [];
        const dirArray = cardinalsOnly ? getCardinalDirections() : get8Directions();
        for (const dir of dirArray) {
            if (Game.map[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].hazard === null
                || Game.map[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].hazard.type !== this.type) {
                directions.push(dir);
            }
        }
        return directions;
    }

    turnToDark() {
        if (this.type === HAZARD_TYPE.FIRE) {
            const clone = this.darkClone();
            this.removeFromWorld();
            clone.addToWorld();

            if (clone.subFire || clone.spreadTimes === 0) {
                if (Math.random() < 0.5) {
                    clone.tileSpread = 2;
                    clone.spreadTimes += 2;
                } else {
                    clone.tileSpread = 3;
                    clone.spreadTimes++;
                }
            }
            clone.turnsLeft += 3;
        }
    }

    darkClone() {
        const darkClone = new DarkFireHazard(this.tilePosition.x, this.tilePosition.y, this.small, this.spreadTimes);
        darkClone.tileSpread = this.tileSpread;
        darkClone.turnsLeft = this.turnsLeft;
        darkClone.subFire = this.subFire;
        darkClone.dead = this.dead;
        return darkClone;
    }

    initParticles() {
        this.particles = [];
        const particlesAmount = 9;
        const rows = Math.floor(Math.sqrt(particlesAmount)); // = cols
        for (let i = 0; i < particlesAmount; i++) {
            const row = Math.floor(i / rows);
            const col = i % rows;
            const particle = new PIXI.Sprite(this.small ? this.particleSmallTexture : this.particleTexture);
            particle.zIndex = this.zIndex + 1;
            Game.world.addChild(particle);
            const gridOffset = this.width / rows * 0.25;
            particle.setRandomPosition = () => {
                particle.position.set(
                    randomInt((this.position.x - this.width / 2) + col * this.width / rows + gridOffset, (this.position.x - this.width / 2) + (col + 1) * this.width / rows - gridOffset),
                    randomInt((this.position.y - this.height / 2) + row * this.height / rows + gridOffset, (this.position.y - this.height / 2) + (row + 1) * this.height / rows - gridOffset));
            };

            let counter = 0;
            let init = true;
            let decayPhase = false;
            const maxScaleStep = 0.007;
            const scaleMod = {
                min: 0.28 * Game.TILESIZE / particle.width + maxScaleStep,
                max: 0.40 * Game.TILESIZE / particle.width - maxScaleStep
            };
            const angleConstraints = {min: -6, max: 6};
            const initAnimationTime = this.getInitAnimationTime();
            let chosenScaleMod = randomFloat(scaleMod.min, scaleMod.max);
            let beforeDeadScale = 1;
            let lastScaleStepSign = 1;
            let animationTime = 0;
            particle.anchor.set(0.5, 0.7);
            particle.setRandomPosition();
            particle.scale.x = particle.scale.y = 0;
            const animation = delta => {
                if (Game.paused) return;
                counter += delta;
                if (!this.small) particle.texture = this.particleTexture;
                if (this.dead || decayPhase) {
                    particle.scale.x = particle.scale.y = Math.max(particle.scale.x - delta / (initAnimationTime) * beforeDeadScale, 0);
                    if (particle.scale.x <= 0 && decayPhase) {
                        particle.setRandomPosition();
                        decayPhase = false;
                        init = true;
                        counter = 0;
                    }
                } else if (init) {
                    beforeDeadScale = particle.scale.x = particle.scale.y = (counter / (initAnimationTime)) * chosenScaleMod;
                    particle.alpha = this.small ? 0.75 : 1;
                    if (counter >= initAnimationTime) {
                        counter = 0;
                        init = false;
                        beforeDeadScale = particle.scale.x = particle.scale.y = chosenScaleMod;
                    }
                } else {
                    if (!this.small && particle.alpha < 1) particle.alpha += delta / initAnimationTime * 0.25;
                    if (Math.random() < 0.65) return;
                    let scaleStep = randomFloat(-maxScaleStep, maxScaleStep);
                    if (Math.random() < 0.8) scaleStep = Math.abs(scaleStep) * lastScaleStepSign;
                    if (particle.scale.x + scaleStep > scaleMod.max) scaleStep = -Math.abs(scaleStep);
                    else if (particle.scale.x + scaleStep < scaleMod.min) scaleStep = Math.abs(scaleStep);
                    beforeDeadScale = particle.scale.x = particle.scale.y = particle.scale.x + scaleStep;
                    lastScaleStepSign = Math.sign(scaleStep);
                    let angleStep = randomFloat(-0.5, 0.5);
                    if (particle.angle + angleStep > angleConstraints.max || particle.angle + angleStep < angleConstraints.min) angleStep *= -1;
                    particle.angle += angleStep;
                    if (counter >= animationTime) {
                        if (animationTime > 0) {
                            decayPhase = true;
                            counter = 0;
                        }
                        animationTime = randomInt(10, 500);
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

        this.tint = this.staticColor + randomInt(this.colorConstraints.min / 0x100, this.colorConstraints.max / 0x100) * 0x100;
        const initAnimationTime = this.getInitAnimationTime();
        this.alpha = 0;
        const animation = delta => {
            if (Game.paused) return;
            if (this.dead) {
                this.alpha -= delta / initAnimationTime;
                if (this.alpha < 0) this.purge();
            } else if (init) {
                counter += delta;
                const endAlpha = this.small ? 0.5 : 1;
                this.alpha = (counter / initAnimationTime) * endAlpha;
                if (counter >= initAnimationTime) {
                    counter = 0;
                    init = false;
                    this.alpha = endAlpha;
                }
            } else {
                if (!this.small && this.alpha < 1) this.alpha += delta / initAnimationTime * 0.5;
                if (Math.random() < 0.5) return;
                let colorStep = randomInt(-2, 2) * 0x100;
                const middleTint = this.tint - this.staticColor;
                if (middleTint + colorStep > this.colorConstraints.max) colorStep = -Math.abs(colorStep);
                else if (middleTint + colorStep < this.colorConstraints.min) colorStep = Math.abs(colorStep);
                this.tint += colorStep;
            }
        };
        Game.infiniteAnimations.push(animation);
        Game.app.ticker.add(animation);
        this.animation = animation;
    }

    getInitAnimationTime() {
        return randomInt(5, 9);
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

export class DarkFireHazard extends FireHazard {
    constructor(tilePositionX, tilePositionY, small = false, spreadTimes = undefined, texture = PIXI.Texture.WHITE) {
        super(tilePositionX, tilePositionY, small, spreadTimes, texture);
        this.type = HAZARD_TYPE.DARK_FIRE;
        this.dark = true;
        this.particleTexture = EffectsSpriteSheet["dark_fire_effect.png"];
        this.particleSmallTexture = EffectsSpriteSheet["dark_fire_effect_small.png"];
        this.staticColor = 0x340070;
        this.colorConstraints = {min: 0x002300, max: 0x004500};
    }
}