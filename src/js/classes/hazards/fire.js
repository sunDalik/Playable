import {Game} from "../../game";
import {Hazard} from "./hazard";
import {HAZARD_TYPE, STAGE} from "../../enums";
import {get8Directions, getCardinalDirections} from "../../utils/map_utils";
import {isNotAWall} from "../../map_checks";
import {randomFloat, randomInt, randomShuffle} from "../../utils/random_utils";
import {removeObjectFromArray} from "../../utils/basic_utils";
import * as PIXI from "pixi.js";

export class FireHazard extends Hazard {
    constructor(tilePositionX, tilePositionY, small = false, spreadTimes = undefined, texture = PIXI.Texture.WHITE) {
        super(texture, tilePositionX, tilePositionY);
        this.tint = 0xd67443;
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
    }

    addToWorld() {
        super.addToWorld();
        if (!this.animation) {
            this.initParticles();
            this.setUpOwnAnimation();
        }
        if (Game.stage === STAGE.DARK_TUNNEL) {
            //this.maskLayer = new PIXI.Sprite(PIXI.Texture.WHITE);
            this.maskLayer = {};
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
        }
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
                        let newHazard;
                        if (this.type === HAZARD_TYPE.FIRE) {
                            newHazard = new FireHazard(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y, true, this.spreadTimes - 1);
                        } else if (this.type === HAZARD_TYPE.DARK_FIRE) {
                            newHazard = new DarkFireHazard(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y, true, this.spreadTimes - 1);
                        }
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
            this.type = HAZARD_TYPE.DARK_FIRE;
            this.dark = true;

            const darkStaticColor = 0x340070;
            const darkColorConstraints = {min: 0x002300, max: 0x004500};
            this.tint = darkStaticColor + randomInt(darkColorConstraints.min / 0x100, darkColorConstraints.max / 0x100) * 0x100;

            if (this.subFire) {
                if (Math.random() < 0.5) {
                    this.tileSpread++;
                    this.spreadTimes += 2;
                } else {
                    this.tileSpread += 2;
                    this.spreadTimes++;
                }
            }
            this.turnsLeft += 3;
        }
    }

    initParticles() {
        this.particles = [];
        const particlesAmount = 9;
        const rows = Math.floor(Math.sqrt(particlesAmount)); // = cols
        for (let i = 0; i < particlesAmount; i++) {
            const row = Math.floor(i / rows);
            const col = i % rows;
            const particle = new PIXI.Sprite(this.small ? Game.resources[`src/images/effects/${this.dark ? "dark_" : ""}fire_effect_small.png`].texture : Game.resources[`src/images/effects/${this.dark ? "dark_" : ""}fire_effect.png`].texture);
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
            const initAnimationTime = randomInt(5, 9);
            let chosenScaleMod = randomFloat(scaleMod.min, scaleMod.max);
            let beforeDeadScale = 1;
            let lastScaleStepSign = 1;
            let animationTime = 0;
            particle.anchor.set(0.5, 0.7);
            particle.setRandomPosition();
            const animation = delta => {
                if (Game.paused) return;
                counter += delta;
                if (this.dark) {
                    if (this.small) particle.texture = Game.resources["src/images/effects/dark_fire_effect_small.png"].texture;
                    else particle.texture = Game.resources["src/images/effects/dark_fire_effect.png"].texture;
                } else {
                    if (this.small) particle.texture = Game.resources["src/images/effects/fire_effect_small.png"].texture;
                    else particle.texture = Game.resources["src/images/effects/fire_effect.png"].texture;
                }
                if (this.dead || decayPhase) {
                    particle.scale.x = particle.scale.y = Math.max(particle.scale.x - delta / (initAnimationTime) * beforeDeadScale, 0);
                    if (particle.scale.x <= 0 && decayPhase) {
                        particle.setRandomPosition();
                        decayPhase = false;
                        init = true;
                        counter = 0;
                    }
                } else if (init) {
                    particle.scale.x = particle.scale.y = (counter / (initAnimationTime)) * chosenScaleMod;
                    beforeDeadScale = particle.scale.x;
                    particle.alpha = this.small ? 0.75 : 1;
                    if (counter >= initAnimationTime) {
                        counter = 0;
                        init = false;
                    }
                } else {
                    if (!this.small && particle.alpha < 1) particle.alpha += delta / initAnimationTime * 0.25;
                    if (Math.random() < 0.65) return;
                    let scaleStep = randomFloat(-maxScaleStep, maxScaleStep);
                    if (Math.random() < 0.8) scaleStep = Math.abs(scaleStep) * lastScaleStepSign;
                    if (particle.scale.x + scaleStep > scaleMod.max) scaleStep = -Math.abs(scaleStep);
                    else if (particle.scale.x + scaleStep < scaleMod.min) scaleStep = Math.abs(scaleStep);
                    particle.scale.x = particle.scale.y = particle.scale.x + scaleStep;
                    beforeDeadScale = particle.scale.x;
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
        const normalStaticColor = 0xd60043;
        const darkStaticColor = 0x340070;
        const normalColorConstraints = {min: 0x006800, max: 0x00a000};
        const darkColorConstraints = {min: 0x002300, max: 0x004500};
        this.tint = this.dark ? darkStaticColor + randomInt(darkColorConstraints.min / 0x100, darkColorConstraints.max / 0x100) * 0x100
            : normalStaticColor + randomInt(normalColorConstraints.min / 0x100, normalColorConstraints.max / 0x100) * 0x100;
        const initAnimationTime = randomInt(5, 9);
        const animation = delta => {
            if (Game.paused) return;
            if (this.dead) {
                this.alpha -= delta / (initAnimationTime);
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
                const colorConstraints = this.dark ? darkColorConstraints : normalColorConstraints;
                const staticColor = this.dark ? darkStaticColor : normalStaticColor;
                if (!this.small && this.alpha < 1) this.alpha += delta / initAnimationTime * 0.5;
                if (Math.random() < 0.5) return;
                let colorStep = randomInt(-2, 2) * 0x100;
                const middleTint = this.tint - staticColor;
                if (middleTint + colorStep > colorConstraints.max) colorStep = -Math.abs(colorStep);
                else if (middleTint + colorStep < colorConstraints.min) colorStep = Math.abs(colorStep);
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

export class DarkFireHazard extends FireHazard {
    constructor(tilePositionX, tilePositionY, small = false, spreadTimes = undefined, texture = PIXI.Texture.WHITE) {
        super(tilePositionX, tilePositionY, small, spreadTimes, texture);
        this.type = HAZARD_TYPE.DARK_FIRE;
        this.dark = true;
    }
}