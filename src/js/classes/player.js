import {Game} from "../game"
import * as PIXI from "pixi.js"
import {AnimatedTileElement} from "./tile_elements/animated_tile_element";
import {
    ARMOR_TYPE,
    EQUIPMENT_TYPE,
    MAGIC_TYPE,
    ROLE,
    SHIELD_TYPE,
    STAGE,
    TILE_TYPE,
    TOOL_TYPE,
    WEAPON_TYPE
} from "../enums";
import {createHeartAnimation, rotate, runDestroyAnimation, shakeScreen, showHelpBox} from "../animations";
import {
    drawHUD,
    redrawBag,
    redrawHealthForPlayer,
    redrawSecondHand,
    redrawSlotContents,
    redrawSlotContentsForPlayer,
    redrawWeaponAndSecondHand
} from "../drawing/draw_hud";
import {amIInTheBossRoom, isInanimate, isRelativelyEmpty} from "../map_checks";
import {activateBossMode, gotoNextLevel, updateInanimates} from "../game_logic";
import {lightPlayerPosition} from "../drawing/lighting";
import {LyingItem} from "./equipment/lying_item";
import {randomChoice} from "../utils/random_utils";
import {otherPlayer, setTickTimeout} from "../utils/game_utils";
import {camera} from "./game/camera";
import {updateChain} from "../drawing/draw_dunno";
import {closeBlackBars, pullUpGameOverScreen} from "../drawing/hud_animations";
import {DEATH_FILTER} from "../filters";
import {removeObjectFromArray} from "../utils/basic_utils";
import {HUD} from "../drawing/hud_object";
import {redrawMiniMapPixel} from "../drawing/minimap";

export class Player extends AnimatedTileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.atkBase = 0;
        this.atkMul = 1;
        this.defBase = 0;
        this.defMul = 1;
        this.SLIDE_ANIMATION_TIME = 8;
        this.SLIDE_BUMP_ANIMATION_TIME = 10;
        this.role = ROLE.PLAYER;
        this.dead = false;
        this.weapon = null;
        this.secondHand = null;
        this.headwear = null;
        this.armor = null;
        this.footwear = null;
        this.magic1 = null;
        this.magic2 = null;
        this.magic3 = null;
        this.bag = null;
        this.shielded = false;
        this.canDoubleAttack = false;
        this.attackTimeout = null;
        this.lastTileStepX = 0;
        this.lastTileStepY = 0;
        this.animationSubSprites = [];
        this.cancellable = true;
        this.fireImmunity = 0;
        this.poisonImmunity = 0;
        this.electricityImmunity = 0;
        this.charging = false;
        this.chargingMagic = null;
        this.doubleAttackCallback = () => {
        };
        this.scaleModifier = 0.8;
        this.fitToTile();
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

        let attackResult = false;
        if (!event.shiftKey && this.weapon !== null) {
            attackResult = this.weapon.attack(this, tileStepX, tileStepY);
            if (attackResult) {
                this.canDoubleAttack = true;
            } else if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON && this.secondHand.type === this.weapon.type
                && this.weapon.uses !== undefined && this.weapon.uses === 0 && this.secondHand.uses !== 0) {
                attackResult = this.secondHand.attack(this, tileStepX, tileStepY);
            }
        }
        if (attackResult) {
            for (const eq of this.getEquipmentAndMagic()) {
                if (eq && eq.afterAttack) eq.afterAttack(this, tileStepX, tileStepY);
            }
        }
        if (!attackResult) {
            if (isInanimate(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY)) {
                this.bump(tileStepX, tileStepY);
                Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x + tileStepX].entity.interact(this, tileStepX, tileStepY);
            } else if (isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY)) {
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
                    if (this.tilePosition.x === Game.bossEntry.x && this.tilePosition.y === Game.bossEntry.y && !Game.bossEntryOpened) {
                        Game.world.removeTile(this.tilePosition.x, this.tilePosition.y, null, false);
                        Game.bossEntryOpened = true;
                        if (Game.stage === STAGE.DARK_TUNNEL) {
                            lightPlayerPosition(Game.player);
                            lightPlayerPosition(Game.player2);
                        }
                    }
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


    castMagic(magic) {
        if (otherPlayer(this).charging || this.charging) return false;
        if (magic) {
            const magicResult = magic.cast(this);
            if (magicResult === false) return false;
            for (const eq of this.getEquipment()) {
                if (eq && eq.onMagicCast) eq.onMagicCast(this);
            }
            const pn = this.getPropertyNameOfItem(magic);
            if (pn) redrawSlotContents(this, pn);
            return true;
        } else return false;
    }

    getMagicById(i) {
        if (i === 1) return this.magic1;
        else if (i === 2) return this.magic2;
        else if (i === 3) return this.magic3;
        else return null;
    }

//only used by necromancy. should revise it
    setMagicById(i, magic) {
        if (i === 1) this.magic1 = magic;
        else if (i === 2) this.magic2 = magic;
        else if (i === 3) this.magic3 = magic;
        redrawSlotContents(this, "magic" + i);
    }

    setStats(atkBase, atkMul, defBase, defMul) {
        this.atkBase = atkBase;
        this.atkMul = atkMul;
        this.defBase = defBase;
        this.defMul = defMul;
    }

    getAtkWithWeapon(weapon, presetAtk = 0) {
        const atkBase = this.getAtkBaseWithWeapon(weapon, presetAtk);
        return (Math.round(atkBase * this.getAtkMul() * 4) / 4)
    }

    getAtkBaseWithWeapon(weapon, presetAtk = 0) {
        let weaponAtk = 0;
        if (weapon) weaponAtk = weapon.atk;
        if (presetAtk) weaponAtk = presetAtk;
        let atkBase = this.atkBase + weaponAtk;
        const atkEquipment = [this.headwear, this.armor, this.footwear];
        for (const equipment of atkEquipment) {
            if (equipment && equipment.atk) {
                atkBase += equipment.atk;
            }
        }
        if (this.secondHand && this.secondHand.equipmentType !== EQUIPMENT_TYPE.WEAPON && this.secondHand.atk) {
            atkBase += this.secondHand.atk;
        }
        return atkBase;

    }

    getAtkMul() {
        return this.atkMul;
    }

    getDef() {
        const defBase = this.getDefBase();
        return (Math.round(defBase * this.getDefMul() * 4) / 4)
    }

    getDefBase() {
        const defEquipment = [this.headwear, this.armor, this.footwear, this.secondHand];
        let defBase = this.defBase;
        for (const equipment of defEquipment) {
            if (equipment && equipment.def) {
                defBase += equipment.def;
            }
        }
        return defBase;
    }

    getDefMul() {
        return this.defMul;
    }

    step(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.STEP_ANIMATION_TIME) {
        if (this.armor && this.armor.type === ARMOR_TYPE.WINGS) {
            this.slide(tileStepX, tileStepY, onFrame, onEnd);
        } else {
            super.step(tileStepX, tileStepY, () => {
                this.onMoveFrame(onFrame);
            }, () => {
                this.onMoveFrame(onEnd);
            }, animationTime);
            this.onMove(animationTime);
        }
    }

    bump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.BUMP_ANIMATION_TIME) {
        if (this.armor && this.armor.type === ARMOR_TYPE.WINGS) {
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
        this.onMove(animationTime);
    }

    onMoveFrame(extra = null) {
        if (extra) extra();
        updateChain();
    }

    onMove(animationTime) {
        lightPlayerPosition(this);
        Game.delayList.push(() => this.pickUpItems());
        camera.moveToCenter(animationTime);
        for (const eq of this.getEquipment()) {
            if (eq && eq.onMove) eq.onMove(this);
        }
    }

    shake(dirX, dirY, animationTime = this.SHAKE_ANIMATION_TIME) {
        super.shake(dirX, dirY, animationTime);
    }

    pickUpItems() {
        if (Game.map[this.tilePosition.y][this.tilePosition.x].item) {
            Game.map[this.tilePosition.y][this.tilePosition.x].item.pickUp(this);
        }
    }

    damage(atk, source, directHit = true, canBeShielded = true) {
        if (atk === 0) return;
        if (!this.dead) {
            let blocked = false;
            if (canBeShielded) {
                const ally = otherPlayer(this);
                if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.SHIELD
                    && (this.shielded || this.secondHand.type === SHIELD_TYPE.PASSIVE && this.secondHand.activate())) {
                    this.secondHand.onBlock(source, this, directHit);
                    this.shielded = true;
                    blocked = true;
                } else if (ally.tilePosition.x === this.tilePosition.x && ally.tilePosition.y === this.tilePosition.y
                    && ally.secondHand && ally.secondHand.equipmentType === EQUIPMENT_TYPE.SHIELD
                    && (ally.shielded || ally.secondHand.type === SHIELD_TYPE.PASSIVE && ally.secondHand.activate())) {
                    ally.secondHand.onBlock(source, ally, directHit);
                    ally.shielded = true;
                    blocked = true;
                } else if (this.armor && this.armor.type === ARMOR_TYPE.WINGS && Math.random() < this.armor.dodgeChance) {
                    rotate(this, randomChoice([true, false]));
                    blocked = true;
                }
            }
            if (!blocked) {
                let dmg = atk - this.getDef();
                if (dmg < 0.25) dmg = 0.25;
                this.health -= dmg;
                redrawHealthForPlayer(this);
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
            redrawHealthForPlayer(this);
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
            Game.world.removeChild(source);
            Game.world.upWorld.addChild(source);
            sourceVisibility = source.visible && source.parent !== null;
            source.visible = true;
        }

        setTickTimeout(() => {
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
        //doesn't drop sometimes???
        if (Game.stage === STAGE.DARK_TUNNEL) {
            if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.TOOL && this.secondHand.type === TOOL_TYPE.TORCH) {
                const item = new LyingItem(this.tilePosition.x, this.tilePosition.y, this.secondHand);
                Game.world.addChild(item);
                Game.map[this.tilePosition.y][this.tilePosition.x].item = item;
                this.secondHand = null;
            }
        }
        camera.moveToCenter(this.STEP_ANIMATION_TIME);
        for (const eq of this.getEquipment()) {
            if (eq && eq.onDeath) eq.onDeath(this);
        }
        this.removeHealthContainers(1);
        otherPlayer(this).removeHealthContainers(1);
        updateInanimates();
    }

    removeHealthContainers(num) {
        this.maxHealth -= num;
        if (this.maxHealth < 1) this.maxHealth = 1;
        if (this.health > this.maxHealth) this.health = this.maxHealth;
        drawHUD()
    }

    addHealthContainers(num, heal = true) {
        this.maxHealth += num;
        if (heal) this.heal(num);
        //might need to expand it to unlimited amount of heart containers later
        if (num === 2) setTickTimeout(() => createHeartAnimation(this.position.x, this.position.y), 20);
        drawHUD();
    }

    heal(healHP, showHeart = true) {
        if (!this.dead) {
            this.health += healHP;
            if (this.health > this.maxHealth) {
                this.health = this.maxHealth;
            }
            redrawHealthForPlayer(this);
            if (showHeart) createHeartAnimation(this.position.x, this.position.y);
        }
    }

    setMovedTexture() {
        if (this === Game.player) this.texture = Game.resources["src/images/player_moved.png"].texture;
        else this.texture = Game.resources["src/images/player2_moved.png"].texture;
    }

    setUnmovedTexture() {
        if (this === Game.player) this.texture = Game.resources["src/images/player.png"].texture;
        else this.texture = Game.resources["src/images/player2.png"].texture;
    }

    giveNewMagic(magic, showHelp = true) {
        if (this.magic1 === null) this.magic1 = magic;
        else if (this.magic2 === null) this.magic2 = magic;
        else if (this.magic3 === null) this.magic3 = magic;
        else return;
        for (const eq of this.getEquipment()) {
            if (eq && eq.onEquipmentReceive) eq.onEquipmentReceive(this, magic);
        }
        if (magic.onWear) magic.onWear(this);
        redrawSlotContents(this, this.getPropertyNameOfItem(magic));
        if (showHelp) showHelpBox(magic);
    }

    applyNextLevelMethods() {
        for (const eq of this.getEquipment()) {
            if (eq && eq.onNextLevel) eq.onNextLevel(this);
        }
        for (const mg of this.getMagic()) {
            if (mg && mg.type !== MAGIC_TYPE.NECROMANCY) {
                mg.uses += Math.ceil(mg.maxUses / 2);
                if (mg.uses > mg.maxUses) mg.uses = mg.maxUses;
            }
        }
        redrawSlotContentsForPlayer(this);
    }

    getEquipment() {
        return [this.weapon, this.secondHand, this.headwear, this.armor, this.footwear];
    }

    getMagic() {
        return [this.magic1, this.magic2, this.magic3];
    }

    getEquipmentAndMagic() {
        return this.getEquipment().concat(this.getMagic());
    }

    releaseMagic(stepX = 0, stepY = 0) {
        if (this.chargingMagic) {
            const magicResult = this.chargingMagic.release(this, stepX, stepY);
            if (magicResult === true) {
                const pn = this.getPropertyNameOfItem(this.chargingMagic);
                if (pn) redrawSlotContents(this, pn);
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
                        const pn = this.getPropertyNameOfItem(mg);
                        if (pn) redrawSlotContents(this, pn);
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
        for (const eq of this.getEquipmentAndMagic()) {
            if (eq && eq.onNewTurn) eq.onNewTurn(this);
        }
        if (this.secondHand) {
            if (this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON && this.weapon && this.secondHand.type === this.weapon.type && this.weapon.type !== WEAPON_TYPE.MAIDEN_DAGGER) {
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
        if (this.weapon.type === WEAPON_TYPE.NINJA_KNIFE) {
            dirX *= -1;
            dirY *= -1;
        }
        Game.app.ticker.remove(this.animation);
        this.rotation = 0; //added because of wings. But what if we want the player to rotate when he is attacking with some weapon?...
        const atkRes = this.secondHand.attack(this, dirX, dirY);
        if (atkRes) {
            for (const eq of this.getEquipmentAndMagic()) {
                if (eq && eq.afterAttack) eq.afterAttack(this, dirX, dirY);
            }
        }
        redrawSecondHand(this);
    }

    useSecondHand() {
        if (this.charging) return false;
        if (!this.secondHand) return false;
        if (this.secondHand.equipmentType === EQUIPMENT_TYPE.SHIELD) {
            if (this.secondHand.activate(this)) {
                this.shielded = true;
                this.spinItem(this.secondHand);
                return true;
            } else return false;
        } else if (this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON) {
            if (this.weapon === null || this.secondHand.type !== this.weapon.type) {
                [this.secondHand, this.weapon] = [this.weapon, this.secondHand];
                redrawWeaponAndSecondHand(this);
                return true;
            } else if (this.weapon && this.weapon.type === this.secondHand.type && this.secondHand.concentrate && this.secondHand.uses < this.weapon.uses && this.weapon.uses === this.weapon.maxUses) {
                this.secondHand.concentrate(this);
                redrawSecondHand(this);
                return true;
            } else return false;
        } else return false;
    }

    concentrateWeapon() {
        if (this.charging) return false;
        if (!this.weapon || !this.weapon.concentrate) return false;
        if (this.weapon.concentrate(this)) {
            if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON && this.secondHand.type === this.weapon.type) {
                this.secondHand.concentrate(this, false);
            }
            return true;
        } else return false;
    }

    useBag() {
        if (this.bag && this.bag.amount > 0) {
            if (this.bag.useItem) {
                this.bag.useItem(this);
                if (this.bag.amount <= 0) this.bag = null;
                redrawBag(this);
                return true;
            }
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

    spinItem(item, animationTime = 20, fullSpinTimes = 1) {
        this.animationCounter = 0;
        const step = 360 * fullSpinTimes / animationTime;
        const itemSprite = new PIXI.Sprite(item.texture);
        itemSprite.anchor.set(0.5, 0.5);
        itemSprite.position.set(this.tilePosition.x * Game.TILESIZE + Game.TILESIZE / 2, this.tilePosition.y * Game.TILESIZE + Game.TILESIZE / 2);
        itemSprite.width = Game.TILESIZE * 0.9;
        itemSprite.height = Game.TILESIZE * 0.9;
        itemSprite.zIndex = Game.primaryPlayer.zIndex + 1;
        Game.world.addChild(itemSprite);

        this.cancelAnimation();
        this.animationSubSprites.push(itemSprite);
        const animation = (delta) => {
            if (Game.paused) return;
            itemSprite.angle += step * delta;
            this.animationCounter += delta;
            if (this.animationCounter >= animationTime) {
                Game.app.ticker.remove(animation);
                this.cancelAnimation();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    getPropertyNameOfItem(item) {
        switch (item) {
            case this.magic1:
                return "magic1";
            case this.magic2:
                return "magic2";
            case this.magic3:
                return "magic3";
            case this.weapon:
                return "weapon";
            case this.secondHand:
                return "secondHand";
            case this.headwear:
                return "headwear";
            case this.armor:
                return "armor";
            case this.footwear:
                return "footwear";
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
}