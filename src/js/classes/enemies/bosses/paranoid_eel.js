import {Game} from "../../../game";
import {DAMAGE_TYPE, ENEMY_TYPE, HAZARD_TYPE} from "../../../enums";
import {Boss} from "./boss";
import {
    getPlayerOnTile,
    isAnyWall,
    isDiggable,
    isEmpty,
    isEnemy,
    isNotAWall,
    isNotOutOfMap,
    isRelativelyEmpty
} from "../../../map_checks";
import {randomChoice, randomChoiceSeveral} from "../../../utils/random_utils";
import {get8Directions, get8DirectionsInRadius} from "../../../utils/map_utils";
import {PoisonHazard} from "../../hazards/poison";
import {Eel} from "../fc/eel";
import {PoisonEel} from "../fc/eel_poison";
import {shakeScreen} from "../../../animations";
import {DarkEel} from "../fc/eel_dark";
import {ParanoidEelSpriteSheet} from "../../../loader";

export class ParanoidEel extends Boss {
    constructor(tilePositionX, tilePositionY, texture = ParanoidEelSpriteSheet["paranoid_eel_neutral.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 25;
        this.type = ENEMY_TYPE.PARANOID_EEL;
        this.name = "Paranoid Eel";
        this.atk = 1;

        this.waitingToMove = true;
        this.startNoActionCounter = 4;

        this.triggeredSpinAttack = false;
        this.spinCounter = 5;
        this.currentSpinCounter = 0;

        this.triggeredSneezeAttack = false;
        this.sneezeCounter = 3;
        this.currentSneezeCounter = 0;

        this.maxTurnsWithoutDamageReactions = 3;
        this.turnsWithoutDamageReactions = 0;

        this.triggeredEelSpit = false;
        this.eelSpitCounter = 2;
        this.currentEelSpitCounter = 0;

        this.triggeredPoisonEelSpit = false;

        this.triggeredStraightPoisonAttack = false;

        this.triggeredVerticalRush = false;
        this.verticalRushCounter = 6;
        this.currentVerticalRushCounter = 0;

        this.triggeredHorizontalRush = false;

        this.direction = {x: 1, y: 0};
        this.setScaleModifier(3.7);
        this.zIndex = Game.primaryPlayer.zIndex + 1;
        this.normalScaleX = this.scale.x;

        this.normTextures = [ParanoidEelSpriteSheet["paranoid_eel_neutral.png"],
            ParanoidEelSpriteSheet["paranoid_eel_neutral_2.png"],
            ParanoidEelSpriteSheet["paranoid_eel_neutral_y.png"],
            ParanoidEelSpriteSheet["paranoid_eel_neutral_y_2.png"]];

        this.minions = [];
        this.minionsLimit = 10;
        this.setCenterPreservation();
        this.removeShadow();
    }

    cancelAnimation() {
        super.cancelAnimation();
        this.correctLook();
    }

    afterMapGen() {
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
        this.placeOnMap();
        for (let x = Game.endRoomBoundaries[0].x + 1; x < Game.endRoomBoundaries[1].x; x++) {
            for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
                if (isEnemy(x, y)) {
                    const entity = Game.map[y][x].entity;
                    if ([ENEMY_TYPE.EEL, ENEMY_TYPE.DARK_EEL, ENEMY_TYPE.POISON_EEL].includes(entity.type)) {
                        this.minions.push(entity);
                    }
                }
            }
        }
        this.minionsLimit = (Game.endRoomBoundaries[1].x - Game.endRoomBoundaries[0].x - 1) *
            (Game.endRoomBoundaries[1].y - Game.endRoomBoundaries[0].y - 1) * 0.12;
    }

    move() {
        if (this.waitingToMove) {
            this.waitingToMove = false;
            if (this.triggeredSpinAttack || this.triggeredPoisonEelSpit || this.triggeredSneezeAttack) this.shake(this.direction.y, this.direction.x);
            if (this.triggeredHorizontalRush || this.triggeredVerticalRush) this.shake(this.direction.x, this.direction.y);
        } else if (this.triggeredStraightPoisonAttack) {
            this.straightPoisonAttack();
            this.triggeredStraightPoisonAttack = false;
            this.correctLook();
        } else if (this.triggeredVerticalRush) {
            this.verticalRush();
            if (this.currentVerticalRushCounter >= this.verticalRushCounter) this.triggeredVerticalRush = false;
        } else if (this.triggeredHorizontalRush) {
            this.horizontalRush();
            this.triggeredHorizontalRush = false;
        } else if (this.triggeredSpinAttack) {
            this.spinAttack();
            if (this.currentSpinCounter >= this.spinCounter) this.triggeredSpinAttack = false;
        } else if (this.triggeredSneezeAttack) {
            this.sneezeAttack();
            if (this.currentSneezeCounter >= this.sneezeCounter) this.triggeredSneezeAttack = false;
        } else if (this.triggeredEelSpit) {
            this.spitEels();
            if (this.currentEelSpitCounter >= this.eelSpitCounter) this.triggeredEelSpit = false;
        } else if (this.triggeredPoisonEelSpit) {
            this.spitPoisonEel();
            this.triggeredPoisonEelSpit = false;
        } else {
            let canMove = true;
            let roll = Math.random() * 100;
            if (this.startNoActionCounter > 0) roll = 999;
            //bugs when it slides into wall then spits and all that happens quickly because you double tap player. Dont know why.
            if (roll < 2) {
                if (this.emptyInFront()) {
                    if (this.canSpawnMinions()) {
                        this.triggeredPoisonEelSpit = true;
                        this.waitingToMove = true;
                        this.correctLook();
                        this.shake(this.direction.y, this.direction.x);
                        canMove = false;
                    }
                }
            } else if (roll < 7) {
                if (this.emptyInFront()) {
                    if (this.canSpawnMinions()) {
                        this.triggeredEelSpit = true;
                        this.currentEelSpitCounter = 0;
                        this.correctLook();
                        this.shake(this.direction.y, this.direction.x);
                        canMove = false;
                    }
                }
            } else if (roll < 9) {
                this.triggeredSpinAttack = true;
                this.correctLook();
                this.currentSpinCounter = 0;
                this.shake(this.direction.y, this.direction.x);
                canMove = false;
            } else if (roll < 14) {
                if (this.canDoPoisonStraightAttack()) {
                    this.triggeredStraightPoisonAttack = true;
                    this.correctLook();
                    this.shake(this.direction.x, this.direction.y);
                    canMove = false;
                }
            } else if (roll < 18) {
                const dir = this.canDoVerticalRushAttack();
                if (dir && this.canPlaceWithDirection(dir)) {
                    this.triggeredVerticalRush = true;
                    this.waitingToMove = true;
                    this.currentVerticalRushCounter = 0;
                    this.removeFromMap();
                    this.direction = dir;
                    this.placeOnMap();
                    this.correctLook();
                    this.shake(this.direction.x, this.direction.y);
                    canMove = false;
                }
            } else if (roll < 24) {
                const dir = this.canDoHorizontalRushAttack();
                if (dir && this.canPlaceWithDirection(dir)) {
                    this.triggeredHorizontalRush = true;
                    this.waitingToMove = true;
                    this.removeFromMap();
                    this.direction = dir;
                    this.placeOnMap();
                    this.correctLook();
                    this.shake(this.direction.x, this.direction.y);
                    canMove = false;
                }
            }
            if (!canMove) return;
            if (isRelativelyEmpty(this.tilePosition.x + this.direction.x * 2, this.tilePosition.y + this.direction.y * 2)) {
                const player = getPlayerOnTile(this.tilePosition.x + this.direction.x * 2, this.tilePosition.y + this.direction.y * 2);
                if (player) {
                    player.damage(this.atk, this, true, true);
                    this.slideBump(this.direction.x, this.direction.y);
                } else this.slide(this.direction.x, this.direction.y);
            } else this.turnAround();
        }
        this.startNoActionCounter--;
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME, turnAwayFromPlayers = false) {
        this.wiggled = false;
        this.correctLook();
        super.slide(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            if (this.animationCounter >= animationTime / 2 && !this.wiggled) {
                this.wiggle();
                this.wiggled = true;
            }
        }, () => {
            if (onEnd) onEnd();
            if (turnAwayFromPlayers && !isEmpty(this.tilePosition.x + Math.sign(tileStepX) * 2,
                this.tilePosition.y + Math.sign(tileStepY) * 2)) {
                this.turnAround();
            } else if (!turnAwayFromPlayers && !isRelativelyEmpty(this.tilePosition.x + Math.sign(tileStepX) * 2,
                this.tilePosition.y + Math.sign(tileStepY) * 2)) {
                this.turnAround();
            }
            this.wiggled = false;
        }, animationTime);
    }

    turnAround() {
        this.correctLook();
        if (this.direction.x !== 0) {
            this.flip();
            this.direction.x *= -1;
        } else if (this.direction.y !== 0) {
            this.rotateByAngle(180);
            this.direction.y *= -1;
        }
    }

    spitEels() {
        if (this.direction.x !== 0) this.texture = ParanoidEelSpriteSheet["paranoid_eel_spitting.png"];
        else if (this.direction.y !== 0) this.texture = ParanoidEelSpriteSheet["paranoid_eel_spitting_y.png"];
        this.currentEelSpitCounter++;
        const minionEel = this.spawnMinion(Eel, this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y);
        minionEel.stun = 1;
        if (this.direction.x !== 0) {
            minionEel.setAngle(90 * (this.direction.x + 2));
        } else if (this.direction.y !== 0) {
            minionEel.setAngle(90 * (-this.direction.y + 1));
        }
        const spitAnimationTime = minionEel.SLIDE_ANIMATION_TIME - 6 + this.currentEelSpitCounter * 2;
        if (isEmpty(this.tilePosition.x + this.direction.x * (this.currentEelSpitCounter + 1), this.tilePosition.y + this.direction.y * (this.currentEelSpitCounter + 1))) {
            minionEel.slide(this.currentEelSpitCounter * this.direction.x, this.currentEelSpitCounter * this.direction.y, null, () => {
                if (Math.random() < 0.5) {
                    minionEel.rotateByAngle(90);
                    minionEel.increaseAngle(90);
                } else {
                    minionEel.rotateByAngle(-90);
                    minionEel.increaseAngle(-90);
                }
                minionEel.updateIntentIcon();
            }, spitAnimationTime);
        } else {
            const player = getPlayerOnTile(this.tilePosition.x + this.direction.x * (this.currentEelSpitCounter + 1), this.tilePosition.y + this.direction.y * (this.currentEelSpitCounter + 1));
            if (player) player.damage(minionEel.atk, this, false, true);
            minionEel.slide(this.currentEelSpitCounter * this.direction.x, this.currentEelSpitCounter * this.direction.y, null, () => {
                minionEel.die(null);
            }, spitAnimationTime);
        }
        minionEel.updateIntentIcon();
    }

    spitPoisonEel() {
        if (this.direction.x !== 0) this.texture = ParanoidEelSpriteSheet["paranoid_eel_spitting.png"];
        else if (this.direction.y !== 0) this.texture = ParanoidEelSpriteSheet["paranoid_eel_spitting_y.png"];
        const minionEel = this.spawnMinion(PoisonEel, this.tilePosition.x + this.direction.x, this.tilePosition.y + this.direction.y);
        minionEel.stun = 1;
        if (this.direction.x !== 0) {
            minionEel.setAngle(90 * (this.direction.x + 2));
        } else if (this.direction.y !== 0) {
            minionEel.setAngle(90 * (-this.direction.y + 1));
        }
        const spitAnimationTime = minionEel.SLIDE_ANIMATION_TIME - 2;
        if (isEmpty(this.tilePosition.x + this.direction.x * 3, this.tilePosition.y + this.direction.y * 3)) {
            minionEel.slide(2 * this.direction.x, 2 * this.direction.y, null, () => {
                if (Math.random() < 0.5) {
                    minionEel.rotateByAngle(90);
                    minionEel.increaseAngle(90);
                } else {
                    minionEel.rotateByAngle(-90);
                    minionEel.increaseAngle(-90);
                }
                minionEel.updateIntentIcon();
            }, spitAnimationTime);
        } else {
            const player = getPlayerOnTile(this.tilePosition.x + this.direction.x * 3, this.tilePosition.y + this.direction.y * 3);
            if (player) player.damage(minionEel.atk, this, false, true);
            minionEel.slide(2 * this.direction.x, 2 * this.direction.y, null, () => {
                minionEel.die(null);
                for (const dir of get8Directions()) {
                    Game.world.addHazard(new PoisonHazard(minionEel.tilePosition.x + dir.x, minionEel.tilePosition.y + dir.y));
                }
            }, spitAnimationTime);
        }
    }

    verticalRush() {
        this.currentVerticalRushCounter++;
        for (let i = this.direction.y * 2; ; i += this.direction.y) {
            if (isAnyWall(this.tilePosition.x, this.tilePosition.y + i) || getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + i)) {
                const player = getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + i);
                if (player) player.damage(this.atk, this, true, true);
                this.slide(0, i - 2 * Math.sign(i), null, () => {
                    if (isAnyWall(this.tilePosition.x, this.tilePosition.y + this.direction.y * 2)) {
                        shakeScreen();
                        if (this.canSpawnMinions()) {
                            const wall = this.randomEndRoomWall();
                            if (wall === undefined) return;
                            Game.world.removeTile(wall.x, wall.y);
                            const minionEel = this.spawnMinion(Eel, wall.x, wall.y);
                            if (wall.x === Game.endRoomBoundaries[0].x) minionEel.setAngle(270);
                            else if (wall.x === Game.endRoomBoundaries[1].x) minionEel.setAngle(90);
                            else if (wall.y === Game.endRoomBoundaries[0].y) minionEel.setAngle(0);
                            else if (wall.y === Game.endRoomBoundaries[1].y) minionEel.setAngle(180);
                            minionEel.turnDelay = 0;
                            minionEel.move();
                        }
                    }
                }, Math.abs(i) * 1.5, true);
                break;
            } else if (isEnemy(this.tilePosition.x, this.tilePosition.y + i)) {
                Game.map[this.tilePosition.y + i][this.tilePosition.x].entity.die(this);
            }
        }
    }

    horizontalRush() {
        if (isEmpty(this.tilePosition.x - this.direction.x * 2, this.tilePosition.y) && this.canSpawnMinions()) {
            const minionEel = this.spawnMinion(DarkEel, this.tilePosition.x - this.direction.x, this.tilePosition.y);
            minionEel.stun = 1;
            minionEel.setAngle(90 * (-this.direction.x + 2));
            const spitAnimationTime = minionEel.SLIDE_ANIMATION_TIME - 4;
            minionEel.slide(-this.direction.x, 0, null, () => {
                if (Math.random() < 0.5) {
                    minionEel.rotateByAngle(90);
                    minionEel.increaseAngle(90);
                } else {
                    minionEel.rotateByAngle(-90);
                    minionEel.increaseAngle(-90);
                }
                minionEel.updateIntentIcon();
            }, spitAnimationTime);
        }
        for (let i = this.direction.x * 2; ; i += this.direction.x) {
            if (isAnyWall(this.tilePosition.x + i, this.tilePosition.y) || getPlayerOnTile(this.tilePosition.x + i, this.tilePosition.y)) {
                const player = getPlayerOnTile(this.tilePosition.x + i, this.tilePosition.y);
                if (player) player.damage(this.atk, this, true, true);
                this.slide(i - 2 * Math.sign(i), 0, null, () => {
                    shakeScreen();
                }, Math.abs(i) * 1.2);
                break;
            } else if (isEnemy(this.tilePosition.x + i, this.tilePosition.y)) {
                Game.map[this.tilePosition.y][this.tilePosition.x + i].entity.die(this);
            }
        }
    }

    straightPoisonAttack() {
        this.bump(this.direction.x, this.direction.y);
        for (let i = (this.direction.x + this.direction.y) * 2; ; i += this.direction.x + this.direction.y) {
            const x = this.tilePosition.x + i * Math.abs(this.direction.x);
            const y = this.tilePosition.y + i * Math.abs(this.direction.y);
            if (isAnyWall(x, y)) break;
            Game.world.addHazard(new PoisonHazard(x, y));
            const player = getPlayerOnTile(x, y);
            if (player) player.damage(this.atk, this, false, true);
        }
    }

    flip() {
        const oldScaleX = this.scale.x;
        const time = 12;
        const step = -Math.sign(oldScaleX) * Math.abs(oldScaleX) * 2 / time;
        let counter = 0;
        const animation = delta => {
            counter += delta;
            this.scale.x += step * delta;
            if (counter >= time) {
                this.scale.x = -oldScaleX;
                Game.app.ticker.remove(animation);
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    wiggle() {
        if (this.triggeredVerticalRush) return;
        if (this.direction.x !== 0) {
            if (this.texture === this.normTextures[0]) {
                this.texture = this.normTextures[1];
            } else {
                this.texture = this.normTextures[0];
            }
        } else if (this.direction.y !== 0) {
            if (this.texture === this.normTextures[2]) {
                this.texture = this.normTextures[3];
            } else {
                this.texture = this.normTextures[2];
            }
        }
    }

    spinAttack() {
        this.currentSpinCounter++;
        this.rotateByAngle(360, 12);
        const tileSpread = Math.min(this.currentSpinCounter, 3);
        const poisonDirs = randomChoiceSeveral(get8DirectionsInRadius(tileSpread, true), 3 + Math.min(this.currentSpinCounter, 3));
        for (const dir of poisonDirs) {
            if (isNotOutOfMap(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                Game.world.addHazard(new PoisonHazard(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y));
            }
        }
        for (const dir of get8Directions()) {
            const player = getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
            if (player) player.damage(this.atk, this, true, true);
        }

        let player = getPlayerOnTile(this.tilePosition.x + this.direction.x * 2, this.tilePosition.y + this.direction.y * 2);
        if (player) player.damage(this.atk, this, true, true);

        player = getPlayerOnTile(this.tilePosition.x - this.direction.x * 2, this.tilePosition.y - this.direction.y * 2);
        if (player) player.damage(this.atk, this, true, true);
    }

    sneezeAttack() {
        this.currentSneezeCounter++;
        let directions = [];
        if (this.direction.x !== 0) {
            directions = [{x: this.direction.x * 2, y: 0},
                {x: this.direction.x * 2, y: -1},
                {x: this.direction.x * 2, y: 1}];
        } else if (this.direction.y !== 0) {
            directions = [{x: 0, y: this.direction.y * 2},
                {x: -1, y: this.direction.y * 2},
                {x: 1, y: this.direction.y * 2}];
        }
        for (const dir of directions) {
            Game.world.addHazard(new PoisonHazard(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y));
            const player = getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y);
            if (player) player.damage(this.atk, this, false, true);
        }
        this.bump(this.direction.x, this.direction.y, null, () => this.rotateDirectionBy90());
    }

    damageWithHazards() {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (Game.map[this.tilePosition.y + y][this.tilePosition.x + x].entity === this) {
                    const hazard = Game.map[this.tilePosition.y][this.tilePosition.x].hazard;
                    if (hazard) {
                        if (hazard.type === HAZARD_TYPE.DARK_FIRE || hazard.type === HAZARD_TYPE.DARK_POISON) {
                            this.damage(hazard, hazard.atk, 0, 0, DAMAGE_TYPE.HAZARDAL);
                        }
                    }
                }
            }
        }
    }

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL) {
        super.damage(source, dmg, inputX, inputY, damageType);
        if (!this.dead) {
            if (damageType === DAMAGE_TYPE.HAZARDAL) return;
            if (this.triggeredSpinAttack || this.triggeredVerticalRush || this.triggeredSneezeAttack || this.triggeredHorizontalRush) return;
            if ((this.direction.x !== -inputX || this.direction.y !== -inputY)
                && !this.triggeredStraightPoisonAttack && !this.triggeredEelSpit && !this.triggeredPoisonEelSpit) this.waitingToMove = true;

            const triggerSpinAttack = () => {
                if (this.triggeredStraightPoisonAttack || this.triggeredEelSpit || this.triggeredPoisonEelSpit) return;
                this.triggeredSpinAttack = true;
                this.correctLook();
                if (!Game.afterTurn) this.waitingToMove = true;
                this.currentSpinCounter = 0;
                this.turnsWithoutDamageReactions = 0;
                this.shake(this.direction.y, this.direction.x);
            };

            if (inputX === 0 && inputY === 0) {
                if (!this.rotateDirectionBy90()) {
                    triggerSpinAttack();
                    return;
                }
            } else if (!this.canPlaceWithShifting(source, inputX, inputY)) {
                triggerSpinAttack();
                return;
            } else {
                this.shiftPositionOnDamage(source, inputX, inputY);
            }
            if (this.triggeredStraightPoisonAttack || this.triggeredEelSpit || this.triggeredPoisonEelSpit) return;
            let roll = Math.random() * 100;
            if (this.turnsWithoutDamageReactions >= this.maxTurnsWithoutDamageReactions) roll = randomChoice([8, 20]);
            if (roll < 16) {
                triggerSpinAttack();
            } else if (roll < 25) {
                this.triggeredSneezeAttack = true;
                this.correctLook();
                if (!Game.afterTurn) this.waitingToMove = true;
                this.currentSneezeCounter = 0;
                this.turnsWithoutDamageReactions = 0;
                this.shake(this.direction.y, this.direction.x);
            } else this.turnsWithoutDamageReactions++;
        }
    }

    randomEndRoomWall() {
        const walls = [];
        for (let x = Game.endRoomBoundaries[0].x + 1; x < Game.endRoomBoundaries[1].x; x++) {
            if (isDiggable(x, Game.endRoomBoundaries[0].y)) walls.push({x: x, y: Game.endRoomBoundaries[0].y});
            if (isDiggable(x, Game.endRoomBoundaries[1].y)) walls.push({x: x, y: Game.endRoomBoundaries[1].y});
        }
        for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
            if (isDiggable(Game.endRoomBoundaries[0].x, y)) walls.push({x: Game.endRoomBoundaries[0].x, y: y});
            if (isDiggable(Game.endRoomBoundaries[1].x, y)) walls.push({x: Game.endRoomBoundaries[1].x, y: y});
        }
        return randomChoice(walls);
    }

    emptyInFront() {
        let directions = [];
        if (this.direction.x !== 0) {
            directions = [{x: this.direction.x * 2, y: 0},
                {x: this.direction.x * 3, y: 0},
                {x: this.direction.x * 2, y: -1},
                {x: this.direction.x * 2, y: 1}];
        } else if (this.direction.y !== 0) {
            directions = [{x: 0, y: this.direction.y * 2},
                {x: 0, y: this.direction.y * 3},
                {x: -1, y: this.direction.y * 2},
                {x: 1, y: this.direction.y * 2}];
        }
        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            if (i === 0 || i === 1) {
                if (!isEmpty(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y)) {
                    return false;
                }
            } else {
                if (Game.map[this.tilePosition.y + dir.y][this.tilePosition.x + dir.x].entity !== null) {
                    return false;
                }
            }
        }
        return true;
    }

    canDoPoisonStraightAttack() {
        for (let i = (this.direction.x + this.direction.y) * 2; ; i += this.direction.x + this.direction.y) {
            const x = this.tilePosition.x + i * Math.abs(this.direction.x) + Math.abs(this.direction.y);
            const y = this.tilePosition.y + i * Math.abs(this.direction.y) + Math.abs(this.direction.x);
            if (getPlayerOnTile(x, y)) return true;
            if (isAnyWall(x, y)) break;
        }
        for (let i = (this.direction.x + this.direction.y) * 2; ; i += this.direction.x + this.direction.y) {
            const x = this.tilePosition.x + i * Math.abs(this.direction.x) - Math.abs(this.direction.y);
            const y = this.tilePosition.y + i * Math.abs(this.direction.y) - Math.abs(this.direction.x);
            if (getPlayerOnTile(x, y)) return true;
            if (isAnyWall(x, y)) break;
        }
        return false;
    }

    canDoVerticalRushAttack() {
        for (let i = 1; ; i++) {
            if (getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + i)) return {x: 0, y: 1};
            if (getPlayerOnTile(this.tilePosition.x - 1, this.tilePosition.y + i)) return {x: 0, y: 1};
            if (getPlayerOnTile(this.tilePosition.x + 1, this.tilePosition.y + i)) return {x: 0, y: 1};
            if (isAnyWall(this.tilePosition.x, this.tilePosition.y + i)) break;
        }
        for (let i = -1; ; i--) {
            if (getPlayerOnTile(this.tilePosition.x, this.tilePosition.y + i)) return {x: 0, y: -1};
            if (getPlayerOnTile(this.tilePosition.x - 1, this.tilePosition.y + i)) return {x: 0, y: -1};
            if (getPlayerOnTile(this.tilePosition.x + 1, this.tilePosition.y + i)) return {x: 0, y: -1};
            if (isAnyWall(this.tilePosition.x, this.tilePosition.y + i)) break;
        }
        return false;
    }

    canDoHorizontalRushAttack() {
        for (let i = 1; ; i++) {
            if (getPlayerOnTile(this.tilePosition.x + i, this.tilePosition.y)) return {x: 1, y: 0};
            if (isAnyWall(this.tilePosition.x + i, this.tilePosition.y)) break;
        }
        for (let i = -1; ; i--) {
            if (getPlayerOnTile(this.tilePosition.x + i, this.tilePosition.y)) return {x: -1, y: 0};
            if (isAnyWall(this.tilePosition.x + i, this.tilePosition.y)) break;
        }
        return false;
    }

    shiftPositionOnDamage(player, inputX, inputY) {
        if (inputX === -this.direction.x && inputY === -this.direction.y) {
            return;
        } else if (inputX === this.direction.x && inputY === this.direction.y) {
            this.turnAround();
        } else {
            if (!player) return;
            this.removeFromMap();
            if (inputX !== 0) {
                this.tilePosition.y += Math.sign(player.tilePosition.y - this.tilePosition.y);
                this.tilePosition.x += Math.sign(this.tilePosition.x - player.tilePosition.x);
            } else if (inputY !== 0) {
                this.tilePosition.x += Math.sign(player.tilePosition.x - this.tilePosition.x);
                this.tilePosition.y += Math.sign(this.tilePosition.y - player.tilePosition.y);
            }
            this.direction = {x: -inputX, y: -inputY};
            this.correctLook();
            this.place();
            this.placeOnMap();
        }
    }

    rotateDirectionBy90() {
        let direction = {};
        if (this.direction.x === 1) {
            direction = {x: 0, y: 1};
        } else if (this.direction.x === -1) {
            direction = {x: 0, y: -1};
        } else if (this.direction.y === 1) {
            direction = {x: -1, y: 0};
        } else if (this.direction.y === -1) {
            direction = {x: 1, y: 0};
        }
        if (this.canPlaceWithDirection(direction)) {
            this.direction = direction;
            this.removeFromMap();
            this.correctLook();
            this.placeOnMap();
            return true;
        } else return false;
    }

    correctLook() {
        if (this.triggeredSpinAttack) {
            if (this.direction.x !== 0) {
                this.texture = ParanoidEelSpriteSheet["paranoid_eel_panic.png"];
            } else if (this.direction.y !== 0) {
                this.texture = ParanoidEelSpriteSheet["paranoid_eel_panic_y.png"];
            }
        } else if (this.triggeredSneezeAttack) {
            if (this.direction.x !== 0) {
                this.texture = ParanoidEelSpriteSheet["paranoid_eel_sneeze.png"];
            } else if (this.direction.y !== 0) {
                this.texture = ParanoidEelSpriteSheet["paranoid_eel_sneeze_y.png"];
            }
        } else if (this.triggeredVerticalRush) {
            this.texture = ParanoidEelSpriteSheet["paranoid_eel_vertical_rush.png"];
        } else if (this.triggeredHorizontalRush) {
            this.texture = ParanoidEelSpriteSheet["paranoid_eel_horizontal_rush.png"];
        } else if (this.triggeredEelSpit || this.triggeredPoisonEelSpit) {
            if (this.direction.x !== 0) {
                this.texture = ParanoidEelSpriteSheet["paranoid_eel_ready_to_spit.png"];
            } else if (this.direction.y !== 0) {
                this.texture = ParanoidEelSpriteSheet["paranoid_eel_ready_to_spit_y.png"];
            }
        } else if (this.triggeredStraightPoisonAttack) {
            if (this.direction.x !== 0) this.texture = ParanoidEelSpriteSheet["paranoid_eel_ready_to_spit_poison.png"];
            else if (this.direction.y !== 0) this.texture = ParanoidEelSpriteSheet["paranoid_eel_ready_to_spit_poison_y.png"];
        } else {
            if (this.direction.x !== 0 && this.texture !== this.normTextures[0] && this.texture !== this.normTextures[1]) {
                if (this.texture === ParanoidEelSpriteSheet["paranoid_eel_spitting.png"]) {
                    this.texture = this.normTextures[0];
                } else if (Math.random() < 0.5) this.texture = this.normTextures[0];
                else this.texture = this.normTextures[1];
            } else if (this.direction.y !== 0 && this.texture !== this.normTextures[2] && this.texture !== this.normTextures[3]) {
                if (this.texture === ParanoidEelSpriteSheet["paranoid_eel_spitting_y.png"]) {
                    this.texture = this.normTextures[2];
                } else if (Math.random() < 0.5) this.texture = this.normTextures[2];
                else this.texture = this.normTextures[3];
            }
        }

        if (this.direction.x !== 0) {
            this.scale.x = this.direction.x * Math.abs(this.normalScaleX);
        } else this.scale.x = Math.abs(this.normalScaleX);

        if (this.direction.y === 1) this.angle = 0;
        else if (this.direction.y === -1) this.angle = 180;
        else this.angle = 0;
    }

    canPlaceWithDirection(direction) {
        return (Game.map[this.tilePosition.y + direction.y][this.tilePosition.x + direction.x].entity === null || Game.map[this.tilePosition.y + direction.y][this.tilePosition.x + direction.x].entity === this)
            && (Game.map[this.tilePosition.y - direction.y][this.tilePosition.x - direction.x].entity === null || Game.map[this.tilePosition.y - direction.y][this.tilePosition.x - direction.x].entity === this)
            && (isNotAWall(this.tilePosition.x + direction.x, this.tilePosition.y + direction.y)
                && isNotAWall(this.tilePosition.x + direction.x * 2, this.tilePosition.y + direction.y * 2)
                || isNotAWall(this.tilePosition.x - direction.x, this.tilePosition.y - direction.y)
                && isNotAWall(this.tilePosition.x - direction.x * 2, this.tilePosition.y - direction.y * 2));
    }

    canPlaceWithShifting(player, inputX, inputY) {
        if (inputX === -this.direction.x && inputY === -this.direction.y
            || inputX === this.direction.x && inputY === this.direction.y) {
            return true;
        } else {
            if (!player) return;
            let tpx = this.tilePosition.x;
            let tpy = this.tilePosition.y;
            if (inputX !== 0) {
                tpy += Math.sign(player.tilePosition.y - this.tilePosition.y);
                tpx += Math.sign(this.tilePosition.x - player.tilePosition.x);
            } else if (inputY !== 0) {
                tpx += Math.sign(player.tilePosition.x - this.tilePosition.x);
                tpy += Math.sign(this.tilePosition.y - player.tilePosition.y);
            }
            return (Game.map[tpy][tpx].entity === null || Game.map[tpy][tpx].entity === this)
                && (Game.map[tpy - inputY][tpx - inputX].entity === null || Game.map[tpy - inputY][tpx - inputX].entity === this)
                && (Game.map[tpy + inputY][tpx + inputX].entity === null || Game.map[tpy + inputY][tpx + inputX].entity === this)
                && (isNotAWall(tpx + inputX, tpy + inputY)
                    && isNotAWall(tpx + inputX * 2, tpy + inputY * 2)
                    || isNotAWall(tpx - inputX, tpy - inputY)
                    && isNotAWall(tpx - inputX * 2, tpy - inputY * 2));
        }
    }

    placeOnMap() {
        super.placeOnMap();
        if (this.direction.x !== 0) {
            this.tilePosition.x++;
            super.placeOnMap();
            this.tilePosition.x -= 2;
            super.placeOnMap();
            this.tilePosition.x++;
        } else if (this.direction.y !== 0) {
            this.tilePosition.y++;
            super.placeOnMap();
            this.tilePosition.y -= 2;
            super.placeOnMap();
            this.tilePosition.y++;
        }
    }

    removeFromMap() {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (Game.map[this.tilePosition.y + y][this.tilePosition.x + x].entity === this) {
                    Game.map[this.tilePosition.y + y][this.tilePosition.x + x].entity = null;
                }
            }
        }
    }

    die(source) {
        super.die(source);
        for (const minion of this.minions) {
            minion.die(null);
        }
    }

    spawnMinion(constructor, x, y) {
        const minion = new constructor(x, y);
        Game.world.addEnemy(minion, true);
        this.minions.push(minion);
        return minion;
    }

    canSpawnMinions() {
        this.minions = this.minions.filter(minion => !minion.dead);
        return this.minions.length < this.minionsLimit;
    }
}