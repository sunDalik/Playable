import {Game} from "../../game";
import {AnimatedTileElement} from "../tile_elements/animated_tile_element";
import {EQUIPMENT_ID, EQUIPMENT_TYPE, ROLE, SLOT, STAGE, TILE_TYPE} from "../../enums";
import {createHeartAnimation, rotate, runDestroyAnimation, shakeScreen, showHelpBox} from "../../animations";
import {
    drawMovementKeyBindings,
    drawOtherHUD,
    redrawHealthForPlayer,
    redrawSecondHand,
    redrawSlotContents,
    redrawSlotContentsForPlayer
} from "../../drawing/draw_hud";
import {amIInTheBossRoom, isInanimate, isRelativelyEmpty} from "../../map_checks";
import {activateBossMode, dropItem, gotoNextLevel, openDoors, updateInanimates} from "../../game_logic";
import {lightPlayerPosition} from "../../drawing/lighting";
import {randomChoice} from "../../utils/random_utils";
import {otherPlayer, setTickTimeout, tileDistance} from "../../utils/game_utils";
import {camera} from "../game/camera";
import {updateChain} from "../../drawing/draw_dunno";
import {closeBlackBars, pullUpGameOverScreen} from "../../drawing/hud_animations";
import {DEATH_FILTER} from "../../filters";
import {removeObjectFromArray} from "../../utils/basic_utils";
import {HUD} from "../../drawing/hud_object";
import {redrawMiniMapPixel} from "../../drawing/minimap";
import {CrystalGuardian} from "../equipment/magic/crystal_guardian";
import {roundToQuarter} from "../../utils/math_utils";

export class Player extends AnimatedTileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this._maxHealth = 3;
        this._health = this._maxHealth;
        this.atkBase = 0;
        this.atkMul = 1;
        this.defBase = 0;
        this.defMul = 1;
        this.magAtkBase = 0;
        this.SLIDE_ANIMATION_TIME = 8;
        this.SLIDE_BUMP_ANIMATION_TIME = 10;
        this.role = ROLE.PLAYER;
        this.dead = false;
        this.definePlayerSlots();
        this.shielded = false;
        this.crystalShielded = false; // is used only with crystal guardian
        this.canDoubleAttack = false;
        this.attackTimeout = null;
        this.lastTileStepX = 0;
        this.lastTileStepY = 0;
        this.animationSubSprites = [];
        this.cancellable = true;
        this.fireImmunity = 0;
        this.poisonImmunity = 0;
        this.electricityImmunity = 0;
        this.linkedHealing = 0;
        this.charging = false;
        this.chargingMagic = null;
        this.doubleAttackCallback = () => {
        };
        this.setScaleModifier(0.87);
    }

    cancelAnimation() {
        if (this.onAnimationEnd) {
            const toCall = this.onAnimationEnd;
            this.onAnimationEnd = null;
            toCall();
        }
        super.cancelAnimation();
        for (const subSprite of this.animationSubSprites) {
            Game.world.removeChild(subSprite);
        }
        if (this.attackTimeout) {
            Game.app.ticker.remove(this.attackTimeout);
            this.doubleAttackCallback();
            //Game.app.ticker.remove(this.animation);
            this.place();
        }
        this.animationSubSprites = [];
        this.rotation = 0;
    }

    move(tileStepX, tileStepY, event) {
        if (otherPlayer(this).charging) return false; //???????????????????
        if (this.charging) {
            return this.releaseMagic(tileStepX, tileStepY);
        }
        this.lastTileStepX = tileStepX;
        this.lastTileStepY = tileStepY;

        if (!this.attack(tileStepX, tileStepY, event)) {
            if (isInanimate(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY)) {
                const result = Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x + tileStepX].entity.interact(this, tileStepX, tileStepY);
                if (result === false) {
                    //ummm thats a hack for now
                } else {
                    this.bump(tileStepX, tileStepY);
                }
            } else if (isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY, true)) {
                if (Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x + tileStepX].tileType === TILE_TYPE.EXIT) {
                    Game.unplayable = true;
                    this.toCloseBlackBars = true;
                    this.step(tileStepX, tileStepY, () => {
                        if (this.toCloseBlackBars && this.animationCounter >= this.STEP_ANIMATION_TIME / 2) {
                            closeBlackBars(gotoNextLevel);
                            this.toCloseBlackBars = false;
                        }
                    });
                    return false;
                } else {
                    this.step(tileStepX, tileStepY);
                    if (Game.boss && !Game.boss.dead && !Game.bossFight && amIInTheBossRoom(this)) {
                        activateBossMode(this);
                    }
                }
            } else if (this.secondHand && this.secondHand.use && this.secondHand.use(this, tileStepX, tileStepY)
                || this.weapon && this.weapon.use && this.weapon.use(this, tileStepX, tileStepY)) {
            } else {
                this.bump(tileStepX, tileStepY);
            }
        }
        return true;
    }

    attack(tileStepX, tileStepY, event) {
        if (Game.map[this.tilePosition.y][this.tilePosition.x].entity === otherPlayer(this)) return false;

        let attackResult = false;
        if (!event.shiftKey && this.weapon !== null) {
            attackResult = this.weapon.attack(this, tileStepX, tileStepY);
            if (attackResult) {
                this.canDoubleAttack = true;
            } else if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON && this.secondHand.id === this.weapon.id
                && this.weapon.uses !== undefined && this.weapon.uses === 0 && this.secondHand.uses !== 0) {
                attackResult = this.secondHand.attack(this, tileStepX, tileStepY);
            }
        }
        if (attackResult) {
            for (const eq of this.getEquipment()) {
                if (eq && eq.afterAttack) eq.afterAttack(this, tileStepX, tileStepY);
            }
        }

        return attackResult;
    }

    castMagic(magic) {
        if (otherPlayer(this).charging || this.charging) return false;
        if (magic) {
            if (magic.cast(this) === false) return false;
            for (const eq of this.getEquipment()) {
                if (eq && eq.onMagicCast) eq.onMagicCast(this);
            }
            this.redrawEquipmentSlot(magic);
            return true;
        } else return false;
    }

    getAtk(weapon, presetAtk = 0) {
        if (weapon === null && presetAtk === 0) return 0;
        let atkBase = presetAtk !== 0 ? presetAtk : weapon.atk;
        atkBase = roundToQuarter(atkBase);
        let multiplier = this.atkMul;
        if (weapon) {
            if (weapon.equipmentType === EQUIPMENT_TYPE.WEAPON) atkBase += this.atkBase;
            if (weapon.magical) atkBase += this.magAtkBase;
            if (weapon.equipmentType === EQUIPMENT_TYPE.MAGIC) multiplier = 1;

            //bad hack
            if (weapon.bowLike && this[SLOT.ACCESSORY] && this[SLOT.ACCESSORY].id === EQUIPMENT_ID.QUIVER_OF_THE_FOREST_SPIRIT) {
                atkBase += this[SLOT.ACCESSORY].bowAtk;
            }
        }
        return roundToQuarter(atkBase * multiplier);
    }

    getDef() {
        return roundToQuarter(this.defBase * this.defMul);
    }

    step(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.STEP_ANIMATION_TIME) {
        if (this[SLOT.ARMOR] && this[SLOT.ARMOR].id === EQUIPMENT_ID.WINGS) {
            this.slide(tileStepX, tileStepY, onFrame, onEnd);
        } else {
            super.step(tileStepX, tileStepY, () => {
                this.onMoveFrame(onFrame);
            }, () => {
                this.onMoveFrame(onEnd);
            }, animationTime);
            this.onMove(animationTime, tileStepX, tileStepY);
        }
    }

    bump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.BUMP_ANIMATION_TIME) {
        if (this[SLOT.ARMOR] && this[SLOT.ARMOR].id === EQUIPMENT_ID.WINGS) {
            this.slideBump(tileStepX, tileStepY, () => {
                this.onMoveFrame(onFrame);
            }, () => {
                this.onMoveFrame(onEnd);
            }, this.SLIDE_BUMP_ANIMATION_TIME);
        } else {
            super.bump(tileStepX, tileStepY, () => {
                this.onMoveFrame(onFrame);
            }, () => {
                this.onMoveFrame(onEnd);
            }, animationTime);
        }
        Game.delayList.push(() => this.pickUpItems());
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        super.slide(tileStepX, tileStepY, () => {
            this.onMoveFrame(onFrame);
        }, () => {
            this.onMoveFrame(onEnd);
        }, animationTime);
        this.onMove(animationTime, tileStepX, tileStepY);
    }

    onMoveFrame(extra = null) {
        if (extra) extra();
        updateChain();
        this.placeShadow();
    }

    onMove(animationTime, tileStepX, tileStepY) {
        openDoors(tileStepX, tileStepY);
        lightPlayerPosition(this);
        Game.delayList.push(() => this.pickUpItems());
        camera.moveToCenter(animationTime);
        for (const eq of this.getEquipment()) {
            if (eq && eq.onMove) eq.onMove(this, tileStepX, tileStepY);
        }
    }

    shake(dirX, dirY, animationTime = this.SHAKE_ANIMATION_TIME) {
        super.shake(dirX, dirY, animationTime);
    }

    pickUpItems() {
        if (this.dead) return;
        if (Game.map[this.tilePosition.y][this.tilePosition.x].item) {
            Game.map[this.tilePosition.y][this.tilePosition.x].item.pickUp(this);
        }
    }

    damage(atk, source, directHit = true, canBeShielded = true, canBeCrystalWinded = true) {
        if (atk === 0) return;
        if (!this.dead) {
            let blocked = false;
            //hack for now :)
            if (canBeCrystalWinded) {
                for (const player of [this, otherPlayer(this)]) {
                    if (player.dead) continue;
                    if (player.crystalShielded) {
                        blocked = true;
                        break;
                    }
                    // 3 is the radius of activation
                    if (player !== this && tileDistance(this, player) > 3) continue;
                    const magic = player.getMagicByConstructor(CrystalGuardian);
                    if (!magic) continue;
                    if (magic.uses > 0) {
                        magic.cast(player);
                        // we don't call onMagicCast methods here!!
                        player.redrawEquipmentSlot(magic);
                        player.crystalShielded = true;
                        blocked = true;
                        break;
                    }
                }
            }
            if (!blocked && canBeShielded) {
                const ally = otherPlayer(this);
                if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.SHIELD
                    && (this.shielded || this.secondHand.activate(this))) {
                    this.secondHand.onBlock(source, this, directHit);
                    this.shielded = true;
                    blocked = true;
                } else if (ally.tilePosition.x === this.tilePosition.x && ally.tilePosition.y === this.tilePosition.y
                    && ally.secondHand && ally.secondHand.equipmentType === EQUIPMENT_TYPE.SHIELD
                    && (ally.shielded || ally.secondHand.activate(ally))) {
                    ally.secondHand.onBlock(source, ally, directHit);
                    ally.shielded = true;
                    blocked = true;
                } else if (this[SLOT.ARMOR] && this[SLOT.ARMOR].id === EQUIPMENT_ID.WINGS && Math.random() < this[SLOT.ARMOR].dodgeChance) {
                    rotate(this, randomChoice([true, false]));
                    blocked = true;
                }
            }
            if (!blocked) {
                let dmg = atk - this.getDef();
                if (dmg < 0.25) dmg = 0.25;
                this.health -= dmg;
                Game.bossNoDamage = false;
                if (this.health <= 0) {
                    this.health = 0;
                    this.dieAnimationWait(source);
                } else {
                    this.runHitAnimation();
                    shakeScreen();
                }
            }
        }
    }

    voluntaryDamage(damage, toShake = true) {
        if (!this.dead) {
            this.health -= damage;
            if (this.health <= 0) this.health = 0.25;
            if (toShake) shakeScreen();
            this.runHitAnimation();
        }
    }

    dieAnimationWait(source) {
        Game.unplayable = true;
        this.dead = true;
        setTickTimeout(() => {
            Game.unplayable = false;
            this.dieAnimation(source, 75);
        }, 5, 99, false);
    }

    dieAnimation(source, time = 40) {
        this.dead = true;
        this.visible = false;
        Game.world.filters.push(DEATH_FILTER);
        HUD.filters.push(DEATH_FILTER);
        Game.paused = true;
        let sourceVisibility;
        camera.centerOnPlayer(this, 6);

        Game.world.upWorld.position = Game.world.position;
        runDestroyAnimation(this, true, 2.5 / time);
        if (source) {
            sourceVisibility = source.visible && source.parent !== null;
            Game.world.removeChild(source);
            Game.world.upWorld.addChild(source);
            source.visible = true;
        }

        setTickTimeout(() => {
            // don't do anything if you aren't relevant anymore...
            // fixes the bug when you hit retry when you are dying
            // although maybe... we should forbid opening pauseScreen when we die !!!
            // potential todo
            if (this !== Game.player && this !== Game.player2) return;

            Game.paused = false;
            if (otherPlayer(this).dead) pullUpGameOverScreen();
            else {
                removeObjectFromArray(DEATH_FILTER, Game.world.filters);
                removeObjectFromArray(DEATH_FILTER, HUD.filters);
            }

            if (source) {
                Game.world.upWorld.removeChild(source);
                Game.world.addChild(source);
                source.visible = sourceVisibility;
                if (source === Game.limitChain) source.visible = false;
            }

            this.die();
        }, time, 99, false);
    }

    die() {
        this.dead = true;
        this.visible = false;
        Game.followMode = false;
        updateChain();
        this.removeFromMap();
        if (Game.stage === STAGE.DARK_TUNNEL) {
            if (this.secondHand && this.secondHand.id === EQUIPMENT_ID.TORCH) {
                dropItem(this.secondHand, this.tilePosition.x, this.tilePosition.y);
                this.secondHand = null;

            }
        }
        camera.moveToCenter(this.STEP_ANIMATION_TIME);
        for (const eq of this.getEquipment()) {
            if (eq && eq.onDeath) eq.onDeath(this);
        }
        redrawSlotContentsForPlayer(this);
        this.removeHealthContainers(1);
        otherPlayer(this).removeHealthContainers(1);
        updateInanimates();
        Game.world.removeChild(this.shadow);
    }

    removeHealthContainers(num) {
        this.maxHealth -= num;
    }

    addHealthContainers(num, heal = true) {
        this.maxHealth += num;
        if (heal) this.heal(num);
        //might need to expand it to unlimited amount of heart containers later
        if (num === 2) setTickTimeout(() => createHeartAnimation(this.position.x, this.position.y), 20);
    }

    heal(healHP, showHeart = true, linkEnabled = true) {
        if (!this.dead && healHP > 0) {
            if ((this.linkedHealing > 0 || otherPlayer(this).linkedHealing > 0) && linkEnabled) {
                otherPlayer(this).heal(healHP, showHeart, false);
            }
            this.health += healHP;
            if (showHeart) createHeartAnimation(this.position.x, this.position.y);
        }
    }

    get health() {
        return this._health;
    }

    set health(value) {
        if (value < 0) this._health = 0;
        else if (value > this._maxHealth) this._health = this._maxHealth;
        else this._health = value;
        redrawHealthForPlayer(this);
    }

    get maxHealth() {
        return this._maxHealth;
    }

    set maxHealth(value) {
        if (value < 1) this._maxHealth = 1;
        else if (value > 10) this._maxHealth = 10;
        else this._maxHealth = value;
        if (this._health > this._maxHealth) this._health = this._maxHealth;
        redrawHealthForPlayer(this);
        drawMovementKeyBindings();
        drawOtherHUD();
    }

    giveNewMagic(magic, showHelp = true) {
        if (magic.constructor.requiredMagic) {
            const replacedMagic = this.getMagicByConstructor(magic.constructor.requiredMagic);
            if (replacedMagic === null) return false;
            else this[this.getSlotNameOfItem(replacedMagic)] = magic;
            if (replacedMagic.onTakeOff) replacedMagic.onTakeOff(this);
        } else {
            if (this.magic1 === null) this.magic1 = magic;
            else if (this.magic2 === null) this.magic2 = magic;
            else if (this.magic3 === null) this.magic3 = magic;
            else return;
        }
        for (const eq of this.getEquipment()) {
            if (eq && eq.onEquipmentReceive) eq.onEquipmentReceive(this, magic);
        }
        if (magic.onWear) magic.onWear(this);
        this.redrawEquipmentSlot(magic);
        if (showHelp) showHelpBox(magic);
    }

    getMagicByConstructor(magicConstructor) {
        for (const magic of this.getMagic()) {
            if (magic && magic.constructor === magicConstructor) return magic;
        }
        return null;
    }

    applyNextLevelMethods() {
        for (const mg of this.getMagic()) {
            if (mg && mg.id !== EQUIPMENT_ID.NECROMANCY) {
                mg.uses += Math.ceil(mg.maxUses / 2);
                if (mg.uses > mg.maxUses) mg.uses = mg.maxUses;
            }
        }
        for (const eq of this.getEquipment()) {
            if (eq && eq.onNextLevel) eq.onNextLevel(this);
        }
        redrawSlotContentsForPlayer(this);
        if (!this.dead) this.regenerateShadow();
    }

    getEquipment() {
        return Object.values(SLOT).map(slot => this[slot]);
    }

    getMagic() {
        return [this.magic1, this.magic2, this.magic3];
    }

    // I hate this (:
    releaseMagic(stepX = 0, stepY = 0) {
        if (this.chargingMagic) {
            const magicResult = this.chargingMagic.release(this, stepX, stepY);
            if (magicResult === true) {
                this.redrawEquipmentSlot(this.chargingMagic);
                this.charging = false;
                this.chargingMagic = null;
                for (const eq of this.getEquipment()) {
                    if (eq && eq.onMagicCast) {
                        eq.onMagicCast(this);
                    }
                }
                return true;
            }
        } else {
            for (const mg of this.getMagic()) {
                if (mg && mg.release) {
                    const magicResult = mg.release(this, stepX, stepY);
                    if (magicResult === true) {
                        this.redrawEquipmentSlot(mg);
                        this.charging = false;
                        for (const eq of this.getEquipment()) {
                            if (eq && eq.onMagicCast) {
                                eq.onMagicCast(this);
                            }
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    }

    afterEnemyTurn() {
        if (this.dead) return false;
        this.shielded = false;
        this.crystalShielded = false;
        for (const eq of this.getEquipment()) {
            if (eq && eq.onNewTurn) eq.onNewTurn(this);
        }
        if (this.secondHand) {
            if (this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON && this.weapon && this.secondHand.id === this.weapon.id && this.weapon.id !== EQUIPMENT_ID.MAIDEN_SHORT_SWORD) {
                if (this.canDoubleAttack) {
                    const dirX = this.lastTileStepX;
                    const dirY = this.lastTileStepY;
                    this.doubleAttackCallback = () => this.doubleAttack(dirX, dirY);
                    this.attackTimeout = setTickTimeout(() => {
                        for (const subSprite of this.animationSubSprites) {
                            Game.world.removeChild(subSprite);
                        }
                        this.doubleAttackCallback();
                    }, 6);
                }
            }
        }
        this.lastTileStepX = 0;
        this.lastTileStepY = 0;
        this.canDoubleAttack = false;
    }

    doubleAttack(dirX, dirY) {
        this.attackTimeout = null;
        if (this.dead) return;
        if (this.weapon.id === EQUIPMENT_ID.ASSASSIN_DAGGER) {
            dirX *= -1;
            dirY *= -1;
        }
        Game.app.ticker.remove(this.animation);
        this.rotation = 0; //added because of wings. But what if we want the player to rotate when he is attacking with some weapon?...
        const atkRes = this.secondHand.attack(this, dirX, dirY);
        if (atkRes) {
            for (const eq of this.getEquipment()) {
                if (eq && eq.afterAttack) eq.afterAttack(this, dirX, dirY);
            }
        }
        redrawSecondHand(this);
    }

    useSecondHand() {
        if (this.charging) return false;
        if (!this.secondHand) return false;
        if (this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON) {
            if (this.weapon === null || this.secondHand.id !== this.weapon.id) {
                [this.secondHand, this.weapon] = [this.weapon, this.secondHand];
                redrawSlotContents(this, SLOT.WEAPON);
                redrawSlotContents(this, SLOT.EXTRA);
                return true;
            } else if (this.weapon && this.weapon.id === this.secondHand.id && this.secondHand.focus && this.secondHand.uses < this.weapon.uses && this.weapon.uses === this.weapon.maxUses) {
                this.secondHand.focus(this);
                redrawSecondHand(this);
                return true;
            } else return false;
        } else return false;
    }

    focusWeapon() {
        if (this.charging) return false;
        if (!this.weapon || !this.weapon.focus) return false;
        if (this.weapon.focus(this)) {
            if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON && this.secondHand.id === this.weapon.id) {
                this.secondHand.focus(this, false);
            }
            return true;
        } else return false;
    }

    useBag() {
        if (this.bag && this.bag.amount > 0) {
            this.bag.useItem(this);
            if (this.bag.amount <= 0) this.bag = null;
            redrawSlotContents(this, SLOT.BAG);
            return true;
        }
        return false;
    }

    microSlide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.MICRO_SLIDE_ANIMATION_TIME, maxDelta = 99) {
        super.microSlide(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            updateChain();
        }, () => {
            if (onEnd) onEnd();
            updateChain();
        }, animationTime, maxDelta);
    }

    redrawEquipmentSlot(equipment) {
        redrawSlotContents(this, this.getSlotNameOfItem(equipment));
    }

    getSlotNameOfItem(item) {
        for (const slot of Object.values(SLOT)) {
            if (item === this[slot]) return slot;
        }
    }

    removeFromMap() {
        if (this === Game.map[this.tilePosition.y][this.tilePosition.x].entity) {
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity;
            Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
        } else if (this === Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity) {
            Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
        }
        redrawMiniMapPixel(this.tilePosition.x, this.tilePosition.y);
    }

    placeOnMap() {
        if (Game.map[this.tilePosition.y][this.tilePosition.x].entity !== null && Game.map[this.tilePosition.y][this.tilePosition.x].entity.role === ROLE.PLAYER) {
            if (this === Game.primaryPlayer) {
                Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = Game.map[this.tilePosition.y][this.tilePosition.x].entity;
                Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
            } else {
                Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = this;
            }
        } else {
            if (Game.map[this.tilePosition.y][this.tilePosition.x].entity === null) {
                Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
            } else if (Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity === null) {
                const entity = Game.map[this.tilePosition.y][this.tilePosition.x].entity;
                if (entity.role === ROLE.BULLET) {
                    entity.attack(this);
                    if (!this.dead) Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
                } else Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = this;
            } else {
                const entity = Game.map[this.tilePosition.y][this.tilePosition.x].entity;
                const secondaryEntity = Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity;
                if (secondaryEntity.role === ROLE.BULLET) {
                    secondaryEntity.attack(this);
                    if (!this.dead) {
                        if (entity.role === ROLE.BULLET) {
                            entity.attack(this);
                            if (!this.dead) {
                                Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
                            }
                        } else Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = this;
                    }
                }
            }
        }
        redrawMiniMapPixel(this.tilePosition.x, this.tilePosition.y);
    }

    definePlayerSlots() {
        for (const slot of Object.values(SLOT)) {
            this[slot] = null;
        }
    }
}