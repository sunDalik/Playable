import {Game} from "../game"
import * as PIXI from "pixi.js"
import {AnimatedTileElement} from "./tile_elements/animated_tile_element";
import {
    ARMOR_TYPE,
    EQUIPMENT_TYPE,
    INANIMATE_TYPE,
    MAGIC_TYPE,
    ROLE,
    SHIELD_TYPE,
    STAGE,
    TILE_TYPE,
    TOOL_TYPE,
    WEAPON_TYPE
} from "../enums";
import {createHeartAnimation, rotate, shakeScreen, showHelpBox} from "../animations";
import {
    drawInteractionKeys,
    drawMovementKeyBindings,
    drawStatsForPlayer,
    redrawHealthForPlayer,
    redrawMiniMapPixel,
    redrawSecondHand,
    redrawSlotContents,
    redrawSlotContentsForPlayer,
    redrawWeapon
} from "../drawing/draw_hud";
import {isInanimate, isRelativelyEmpty} from "../map_checks";
import {gotoNextLevel, removeEquipmentFromPlayer, swapEquipmentWithPlayer} from "../game_logic";
import {lightPlayerPosition} from "../drawing/lighting";
import {LyingItem} from "./equipment/lying_item";
import {randomChoice} from "../utils/random_utils";
import {getEffectivePlayerCenter, otherPlayer, setTickTimeout} from "../utils/game_utils";
import {camera} from "./game/camera";

export class Player extends AnimatedTileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.atkBase = 0;
        this.atkMul = 1;
        this.extraAtkMul = 1;
        this.defBase = 0;
        this.defMul = 1;
        this.extraDefMul = 1;
        this.STEP_ANIMATION_TIME = 8;
        this.BUMP_ANIMATION_TIME = 12;
        this.SLIDE_ANIMATION_TIME = 8;
        this.SLIDE_BUMP_ANIMATION_TIME = 10;
        this.PUSH_PULL_ANIMATION_TIME = 6;
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
        this.magic4 = null;
        this.shielded = false;
        this.canDoubleAttack = false;
        this.attackTimeout = null;
        this.savedTileStepX = 0;
        this.savedTileStepY = 0;
        this.animationSubSprites = [];
        this.carried = false;
        this.pushPullMode = false;
        this.cancellable = true;
        this.fireImmunity = 0;
        this.poisonImmunity = 0;
        this.electricityImmunity = 0;
        this.charging = false;
        this.chargingMagic = null;
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
            this.doubleAttack();
            Game.app.ticker.remove(this.animation);
            this.place();
        }
        this.animationSubSprites = [];
        this.rotation = 0;
    }

    move(tileStepX, tileStepY, event) {
        if (otherPlayer(this).pushPullMode || otherPlayer(this).charging) return false;
        if (this.pushPullMode) {
            if (this.tilePosition.x === otherPlayer(this).tilePosition.x && tileStepY !== 0
                || this.tilePosition.y === otherPlayer(this).tilePosition.y && tileStepX !== 0) {
                let result = false;
                if (isRelativelyEmpty(otherPlayer(this).tilePosition.x + tileStepX, otherPlayer(this).tilePosition.y + tileStepY)) {
                    if (isRelativelyEmpty(otherPlayer(this).tilePosition.x + tileStepX * 2, otherPlayer(this).tilePosition.y + tileStepY * 2)) {
                        otherPlayer(this).slide(tileStepX * 2, tileStepY * 2, this.PUSH_PULL_ANIMATION_TIME);
                        result = true;
                    } else {
                        otherPlayer(this).slide(tileStepX, tileStepY, this.PUSH_PULL_ANIMATION_TIME);
                        result = true;
                    }
                } else {
                    otherPlayer(this).microSlide(0, 0);
                    result = false;
                }
                this.pushPullMode = false;
                drawMovementKeyBindings();
                drawInteractionKeys();
                return result;
            } else return false;
        }

        if (this.charging) {
            return this.releaseMagic(tileStepX, tileStepY);
        }

        let attackResult = false;
        if (!event.shiftKey && this.weapon !== null) {
            attackResult = this.weapon.attack(this, tileStepX, tileStepY);
            if (attackResult) {
                this.canDoubleAttack = true;
                this.savedTileStepX = tileStepX;
                this.savedTileStepY = tileStepY;
            } else if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON && this.secondHand.type === this.weapon.type
                && this.weapon.uses !== undefined && this.weapon.uses === 0 && this.secondHand.uses !== 0) {
                attackResult = this.secondHand.attack(this, tileStepX, tileStepY);
            }
        }
        if (!attackResult) {
            if (isInanimate(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY)) {
                this.interactWithInanimateEntity(Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x + tileStepX].entity);
                this.bump(tileStepX, tileStepY);
            } else if (isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y + tileStepY)) {
                if (Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x + tileStepX].tileType === TILE_TYPE.EXIT) {
                    gotoNextLevel();
                    return false;
                } else {
                    this.step(tileStepX, tileStepY);
                    for (const eq of this.getEquipment()) {
                        if (eq && eq.onMove) eq.onMove(this);
                    }
                }
            } else if (this.secondHand && this.secondHand.use && this.secondHand.use(this, tileStepX, tileStepY)
                || this.weapon && this.weapon.use && this.weapon.use(this, tileStepX, tileStepY)) {
            } else {
                this.bump(tileStepX, tileStepY);
            }
        }
    }


    castMagic(magic) {
        if (this.pushPullMode || otherPlayer(this).pushPullMode || otherPlayer(this).charging || this.charging) return false;
        if (magic) {
            const magicResult = magic.cast(this);
            if (magicResult === false) return false;
            for (const eq of this.getEquipment()) {
                if (eq && eq.onMagicCast) {
                    eq.onMagicCast(this);
                }
            }
            const pn = this.getPropertyNameOfItem(magic);
            if (pn) redrawSlotContents(this, pn);
        }
    }

    getMagicById(i) {
        if (i === 1) return this.magic1;
        else if (i === 2) return this.magic2;
        else if (i === 3) return this.magic3;
        else if (i === 4) return this.magic4;
        else return null;
    }

//only used by necromancy. should revise it
    setMagicById(i, magic) {
        if (i === 1) this.magic1 = magic;
        else if (i === 2) this.magic2 = magic;
        else if (i === 3) this.magic3 = magic;
        else if (i === 4) this.magic4 = magic;
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
        return this.atkMul * this.extraAtkMul;
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
        return this.defMul * this.extraDefMul;
    }

    step(tileStepX, tileStepY) {
        if (this.armor && this.armor.type === ARMOR_TYPE.WINGS && !this.carried) {
            this.slide(tileStepX, tileStepY);
        } else {
            super.step(tileStepX, tileStepY);
            if (otherPlayer(this).carried) otherPlayer(this).step(tileStepX, tileStepY);
            lightPlayerPosition(this);
            this.pickUpItems();
            camera.setNewPoint(getEffectivePlayerCenter().x, getEffectivePlayerCenter().y, this.STEP_ANIMATION_TIME);
        }
        if (!Game.player.carried && !Game.player2.carried) drawInteractionKeys();
    }

    bump(tileStepX, tileStepY) {
        if (this.armor && this.armor.type === ARMOR_TYPE.WINGS && !this.carried) {
            this.slideBump(tileStepX, tileStepY, null, null, this.SLIDE_BUMP_ANIMATION_TIME);
            if (otherPlayer(this).carried) otherPlayer(this).slideBump(tileStepX, tileStepY, null, null, this.SLIDE_BUMP_ANIMATION_TIME);
        } else {
            super.bump(tileStepX, tileStepY);
            if (otherPlayer(this).carried) otherPlayer(this).bump(tileStepX, tileStepY);
        }
    }

    slide(tileDirX, tileDirY, SLIDE_ANIMATION_TIME = this.SLIDE_ANIMATION_TIME) {
        super.slide(tileDirX, tileDirY, null, null, SLIDE_ANIMATION_TIME);
        lightPlayerPosition(this);
        this.pickUpItems();
        if (otherPlayer(this).carried) otherPlayer(this).slide(tileDirX, tileDirY);
        if (!Game.player.carried && !Game.player2.carried) drawInteractionKeys();
        camera.setNewPoint(getEffectivePlayerCenter().x, getEffectivePlayerCenter().y, this.SLIDE_ANIMATION_TIME);
    }

    shake(dirX, dirY, animationTime = this.SHAKE_ANIMATION_TIME) {
        super.shake(dirX, dirY, animationTime);
        if (otherPlayer(this).carried) otherPlayer(this).shake(dirX, dirY, animationTime);
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
                    && (this.shielded || this.secondHand.type === SHIELD_TYPE.PASSIVE) && this.secondHand.onBlock(source, this, directHit)) {
                    blocked = true;
                } else if (ally.tilePosition.x === this.tilePosition.x && ally.tilePosition.y === this.tilePosition.y
                    && ally.secondHand && ally.secondHand.equipmentType === EQUIPMENT_TYPE.SHIELD
                    && (ally.shielded || ally.secondHand.type === SHIELD_TYPE.PASSIVE) && ally.secondHand.onBlock(source, ally, directHit)) {
                    blocked = true;
                } else if (this.armor && this.armor.type === ARMOR_TYPE.WINGS && Math.random() < this.armor.dodgeChance) {
                    const rotateClockwise = randomChoice([true, false]);
                    rotate(this, rotateClockwise);
                    if (otherPlayer(this).carried) rotate(otherPlayer(this), rotateClockwise);
                    blocked = true;
                }
            }
            if (!blocked) {
                let dmg = atk - this.getDef();
                if (dmg < 0.25) dmg = 0.25;
                this.health -= dmg;
                shakeScreen();
                redrawHealthForPlayer(this);
                if (this.health <= 0) {
                    this.die();
                }
            }
        }
    }

    voluntaryDamage(damage, toShake = true) {
        if (!this.dead) {
            this.health -= damage;
            if (this.health <= 0) this.health = 0.25;
            if (toShake) shakeScreen();
            redrawHealthForPlayer(this);
        }
    }

    die() {
        this.carried = false;
        otherPlayer(this).carried = false;
        this.extraAtkMul = 1;
        this.extraDefMul = 1;
        drawStatsForPlayer(this);
        this.dead = true;
        this.visible = false;
        drawMovementKeyBindings(this);
        drawInteractionKeys(this);
        this.removeFromMap(this);
        if (Game.stage === STAGE.DARK_TUNNEL) {
            if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.TOOL && this.secondHand.type === TOOL_TYPE.TORCH) {
                const item = new LyingItem(this.tilePosition.x, this.tilePosition.y, this.secondHand);
                Game.world.addChild(item);
                Game.tiles.push(item);
                Game.map[this.tilePosition.y][this.tilePosition.x].item = item;
                this.secondHand = null;
                redrawSecondHand(this);
            }
        }
        camera.setNewPoint(getEffectivePlayerCenter().x, getEffectivePlayerCenter().y, this.STEP_ANIMATION_TIME);
        for (const eq of this.getEquipment()) {
            if (eq && eq.onDeath) {
                eq.onDeath(this);
            }
        }
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

    interactWithInanimateEntity(entity) {
        switch (entity.type) {
            case INANIMATE_TYPE.STATUE:
                if (!entity.marauded) Game.maraudedStatues.push(entity.weapon);
                if (entity.weapon === null) entity.weapon = removeEquipmentFromPlayer(this, EQUIPMENT_TYPE.WEAPON);
                else entity.weapon = swapEquipmentWithPlayer(this, entity.weapon);
                entity.updateTexture();
                entity.maraud();
                break;
            case INANIMATE_TYPE.OBELISK:
                if (entity.working) {
                    if (!entity.activated) entity.activate();
                    else entity.donate(this);
                }
                break;
            case INANIMATE_TYPE.GRAIL:
                if (entity.magic) {
                    entity.choose(this);
                }
                break;
            case INANIMATE_TYPE.CHEST:
                entity.interact(this);
                break;
        }
    }

    giveNewMagic(magic, showHelp = true) {
        if (this.magic1 === null) this.magic1 = magic;
        else if (this.magic2 === null) this.magic2 = magic;
        else if (this.magic3 === null) this.magic3 = magic;
        else if (this.magic4 === null) this.magic4 = magic;
        else return;
        for (const eq of this.getEquipment()) {
            if (eq && eq.onEquipmentReceive) {
                eq.onEquipmentReceive(this, magic);
            }
        }
        redrawSlotContents(this, this.getPropertyNameOfItem(magic));
        if (showHelp) showHelpBox(magic);
    }

    applyNextLevelMethods() {
        for (const eq of this.getEquipment()) {
            if (eq && eq.onNextLevel) {
                eq.onNextLevel(this);
            }
        }
        for (const mg of this.getMagic()) {
            if (mg && mg.type !== MAGIC_TYPE.NECROMANCY) mg.uses = mg.maxUses;
        }
        redrawSlotContentsForPlayer(this);
    }

    getEquipment() {
        return [this.weapon, this.secondHand, this.headwear, this.armor, this.footwear];
    }

    getMagic() {
        return [this.magic1, this.magic2, this.magic3, this.magic4];
    }

    getEquipmentAndMagic() {
        return this.getEquipment().concat(this.getMagic());
    }

    releaseMagic(stepX = 0, stepY = 0) {
        if (this.pushPullMode || otherPlayer(this).pushPullMode || otherPlayer(this).charging) return false;
        if (this.chargingMagic) {
            const magicResult = this.chargingMagic.release(this, stepX, stepY);
            if (magicResult === true) {
                const pn = this.getPropertyNameOfItem(this.chargingMagic);
                if (pn) redrawSlotContents(this, pn);
                this.charging = false;
                this.chargingMagic = null;
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
                        return true;
                    }
                }
            }
        }
        return false;
    }

    afterEnemyTurn() {
        this.shielded = false;
        for (const eq of this.getEquipmentAndMagic()) {
            if (eq && eq.onNewTurn) eq.onNewTurn(this);
        }
        if (this.secondHand) {
            if (this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON && this.weapon && this.secondHand.type === this.weapon.type && this.weapon.type !== WEAPON_TYPE.MAIDEN_DAGGER) {
                if (this.canDoubleAttack) {
                    this.attackTimeout = setTickTimeout(() => {
                        for (const subSprite of this.animationSubSprites) {
                            Game.world.removeChild(subSprite);
                        }
                        this.doubleAttack();
                    }, 6);
                }
            }
        }
        this.canDoubleAttack = false;
    }

    doubleAttack() {
        if (this.weapon.type === WEAPON_TYPE.NINJA_KNIFE) {
            this.savedTileStepX *= -1;
            this.savedTileStepY *= -1;
        }
        Game.app.ticker.remove(this.animation);
        this.rotation = 0; //added because of wings. But what if we want the player to rotate when he is attacking with some weapon?...
        this.secondHand.attack(this, this.savedTileStepX, this.savedTileStepY);
        redrawSecondHand(this);
        this.attackTimeout = null;
    }

    useSecondHand() {
        if (this.pushPullMode || otherPlayer(this).pushPullMode || otherPlayer(this).charging || this.charging) return false;
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
                redrawWeapon(this);
                redrawSecondHand(this);
                if (this.armor && this.armor.type === ARMOR_TYPE.ELECTRIC) return false;
                return true;
            } else if (this.weapon && this.weapon.type === this.secondHand.type && this.secondHand.concentrate && this.secondHand.uses < this.weapon.uses && this.weapon.uses === this.weapon.maxUses) {
                this.secondHand.concentrate(this);
                redrawSecondHand(this);
                if (this.armor && this.armor.type === ARMOR_TYPE.ELECTRIC && this.secondHand.concentration === 1) return false;
                return true;
            } else return false;
        } else return false;
    }

    concentrateWeapon() {
        if (this.pushPullMode || otherPlayer(this).pushPullMode || otherPlayer(this).charging || this.charging) return false;
        if (!this.weapon || !this.weapon.concentrate) return false;
        if (this.weapon.concentrate(this)) {
            if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON && this.secondHand.type === this.weapon.type) {
                this.secondHand.concentrate(this, false);
            }
            if (this.armor && this.armor.type === ARMOR_TYPE.ELECTRIC && this.weapon.concentration === 1) return false;
            return true;
        } else return false;
    }

    pushOrPull() {
        if (otherPlayer(this).pushPullMode || otherPlayer(this).charging || this.charging) return false;
        if (this.pushPullMode) {
            this.pushPullMode = false;
            otherPlayer(this).microSlide(0, 0);
        } else {
            if (Math.abs(otherPlayer(this).tilePosition.x - this.tilePosition.x) + Math.abs(otherPlayer(this).tilePosition.y - this.tilePosition.y) === 1) {
                this.pushPullMode = true;
                otherPlayer(this).microSlide(this.tilePosition.x - otherPlayer(this).tilePosition.x, this.tilePosition.y - otherPlayer(this).tilePosition.y);
                otherPlayer(this).cancellable = false;
            }
        }
        drawMovementKeyBindings();
        drawInteractionKeys();
        return false;
    }

    spinItem(item, animationTime = 20, fullSpinTimes = 1) {
        this.animationCounter = 0;
        const step = 360 * fullSpinTimes / animationTime;
        const itemSprite = new PIXI.Sprite(item.texture);
        itemSprite.anchor.set(0.5, 0.5);
        itemSprite.position.set(this.tilePosition.x * Game.TILESIZE + Game.TILESIZE / 2, this.tilePosition.y * Game.TILESIZE + Game.TILESIZE / 2);
        itemSprite.width = Game.TILESIZE * 0.9;
        itemSprite.height = Game.TILESIZE * 0.9;
        itemSprite.zIndex = 2;
        Game.world.addChild(itemSprite);

        this.cancelAnimation();
        this.animationSubSprites.push(itemSprite);
        const animation = (delta) => {
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
            case this.magic4:
                return "magic4";
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