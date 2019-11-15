import {Game} from "../game"
import * as PIXI from "pixi.js"
import {AnimatedTileElement} from "./tile_elements/animated_tile_element";
import {EQUIPMENT_TYPE, INANIMATE_TYPE, MAGIC_TYPE, ROLE, SHIELD_TYPE, TILE_TYPE, TOOL_TYPE} from "../enums";
import {centerCamera, centerCameraX, centerCameraY, redrawTiles, scaleGameMap} from "../camera";
import {shakeScreen} from "../animations";
import {
    redrawHealthForPlayer,
    redrawSecondHand,
    redrawSlotContents,
    redrawSlotContentsForPlayer
} from "../drawing/draw_hud";
import {isAWall, isInanimate, isRelativelyEmpty} from "../map_checks";
import {calculateDetectionGraph} from "../map_generation"
import {
    gotoNextLevel,
    placePlayerOnGameMap, removeEquipmentFromPlayer,
    removePlayerFromGameMap,
    removeTileFromWorld,
    swapEquipmentWithPlayer
} from "../game_logic";
import {lightPlayerPosition} from "../drawing/lighting";

export class Player extends AnimatedTileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 4;
        this.health = this.maxHealth;
        this.atkBase = 0;
        this.atkMul = 1;
        this.defBase = 0;
        this.defMul = 1;
        this.STEP_ANIMATION_TIME = 8;
        this.BUMP_ANIMATION_TIME = 12;
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
        this.animationSubSprites = [];
    }

    cancelAnimation() {
        super.cancelAnimation();
        for (const subSprite of this.animationSubSprites) {
            Game.world.removeChild(subSprite);
        }
        this.animationSubSprites = [];
        this.rotation = 0;
        scaleGameMap();
    }

    move(tileStepX, tileStepY, event) {
        if (event.shiftKey || this.weapon === null || this.weapon.attack(this, tileStepX, tileStepY) === false) {
            if (tileStepX !== 0) {
                if (isInanimate(this.tilePosition.x + tileStepX, this.tilePosition.y)) {
                    this.interactWithInanimateEntity(Game.map[this.tilePosition.y][this.tilePosition.x + tileStepX].entity);
                    this.bumpX(tileStepX);
                } else if (isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y)) {
                    removePlayerFromGameMap(this);
                    this.stepX(tileStepX);
                    placePlayerOnGameMap(this);
                    if (Game.map[this.tilePosition.y][this.tilePosition.x].tileType === TILE_TYPE.EXIT) gotoNextLevel();
                } else if (isAWall(this.tilePosition.x + tileStepX, this.tilePosition.y)
                    && this.secondHand !== null && this.secondHand.equipmentType === EQUIPMENT_TYPE.TOOL && this.secondHand.type === TOOL_TYPE.PICKAXE) {
                    removeTileFromWorld(Game.map[this.tilePosition.y][this.tilePosition.x + tileStepX].tile);
                    if (Game.map[this.tilePosition.y + 1][this.tilePosition.x + tileStepX].tileType === TILE_TYPE.ENTRY
                        || Game.map[this.tilePosition.y - 1][this.tilePosition.x + tileStepX].tileType === TILE_TYPE.ENTRY
                        || Game.map[this.tilePosition.y][this.tilePosition.x + tileStepX + 1].tileType === TILE_TYPE.ENTRY
                        || Game.map[this.tilePosition.y][this.tilePosition.x + tileStepX - 1].tileType === TILE_TYPE.ENTRY) {
                        Game.map[this.tilePosition.y][this.tilePosition.x + tileStepX].tileType = TILE_TYPE.ENTRY;
                    } else {
                        Game.map[this.tilePosition.y][this.tilePosition.x + tileStepX].tileType = Game.map[this.tilePosition.y][this.tilePosition.x].tileType;
                    }
                    lightPlayerPosition(this);
                    calculateDetectionGraph(Game.map);
                    this.bumpX(tileStepX);
                } else this.bumpX(tileStepX);
            } else if (tileStepY !== 0) {
                if (isInanimate(this.tilePosition.x, this.tilePosition.y + tileStepY)) {
                    this.interactWithInanimateEntity(Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x].entity);
                    this.bumpY(tileStepY);
                } else if (isRelativelyEmpty(this.tilePosition.x, this.tilePosition.y + tileStepY)) {
                    removePlayerFromGameMap(this);
                    this.stepY(tileStepY);
                    placePlayerOnGameMap(this);
                    if (Game.map[this.tilePosition.y][this.tilePosition.x].tileType === TILE_TYPE.EXIT) gotoNextLevel();
                } else if (isAWall(this.tilePosition.x, this.tilePosition.y + tileStepY)
                    && this.secondHand !== null && this.secondHand.equipmentType === EQUIPMENT_TYPE.TOOL && this.secondHand.type === TOOL_TYPE.PICKAXE) {
                    removeTileFromWorld(Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x].tile);
                    if (Game.map[this.tilePosition.y + tileStepY + 1][this.tilePosition.x].tileType === TILE_TYPE.ENTRY
                        || Game.map[this.tilePosition.y + tileStepY - 1][this.tilePosition.x].tileType === TILE_TYPE.ENTRY
                        || Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x + 1].tileType === TILE_TYPE.ENTRY
                        || Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x - 1].tileType === TILE_TYPE.ENTRY) {
                        Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x].tileType = TILE_TYPE.ENTRY;
                    } else {
                        Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x].tileType = Game.map[this.tilePosition.y][this.tilePosition.x].tileType;
                    }
                    lightPlayerPosition(this);
                    calculateDetectionGraph(Game.map);
                    this.bumpY(tileStepY);
                } else
                    this.bumpY(tileStepY);
            }
        }
    }


    castMagic(magic) {
        if (magic) {
            const magicResult = magic.cast(this);
            if (magicResult === false) return false;
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

    getAtkWithWeapon(weapon) {
        const atkBase = this.getAtkBaseWithWeapon(weapon);
        return (Math.round(atkBase * this.atkMul * 4) / 4)
    }

    getAtkBaseWithWeapon(weapon) {
        let weaponAtk = 0;
        if (weapon) weaponAtk = weapon.atk;
        let atkBase = this.atkBase + weaponAtk;
        const atkEquipment = [this.headwear, this.armor, this.footwear, this.secondHand];
        for (const equipment of atkEquipment) {
            if (equipment && equipment.atk) {
                atkBase += equipment.atk;
            }
        }
        return atkBase;

    }

    getDef() {
        const defBase = this.getDefBase();
        return (Math.round(defBase * this.defMul * 4) / 4)
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

    stepX(tileStepX) {
        super.stepX(tileStepX, () => centerCameraX(false), scaleGameMap);
        lightPlayerPosition(this);
    }

    stepY(tileStepY) {
        super.stepY(tileStepY, () => centerCameraY(false), scaleGameMap);
        lightPlayerPosition(this);
    }

    damage(atk, source, directHit = true) {
        if (!this.dead) {
            const otherPlayer = this === Game.player ? Game.player2 : Game.player;
            if (this.secondHand && this.secondHand.equipmentType === EQUIPMENT_TYPE.SHIELD
                && (this.shielded || this.secondHand.type === SHIELD_TYPE.PASSIVE)) {
                this.secondHand.onBlock(source, this, directHit);
            } else if (otherPlayer.tilePosition.x === this.tilePosition.x && otherPlayer.tilePosition.y === this.tilePosition.y
                && otherPlayer.secondHand && otherPlayer.secondHand.equipmentType === EQUIPMENT_TYPE.SHIELD
                && (otherPlayer.shielded || otherPlayer.secondHand.type === SHIELD_TYPE.PASSIVE)) {
                otherPlayer.secondHand.onBlock(source, otherPlayer);
            } else {
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

    die() {
        this.dead = true;
        this.visible = false;
        removePlayerFromGameMap(this);
        Game.TILESIZE = Game.REFERENCE_TILESIZE;
        redrawTiles();
    }

    heal(healHP) {
        if (!this.dead) {
            this.health += healHP;
            if (this.health > this.maxHealth) {
                this.health = this.maxHealth;
            }
            redrawHealthForPlayer(this);
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

    slide(tileDirX, tileDirY, SLIDE_ANIMATION_TIME = this.SLIDE_ANIMATION_TIME) {
        super.slide(tileDirX, tileDirY, () => centerCamera(), scaleGameMap, SLIDE_ANIMATION_TIME);
        lightPlayerPosition(this);
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

    giveNewMagic(magic) {
        if (this.magic1 === null) this.magic1 = magic;
        else if (this.magic2 === null) this.magic2 = magic;
        else if (this.magic3 === null) this.magic3 = magic;
        else if (this.magic4 === null) this.magic4 = magic;
        else return;
        this.applyOnMagicReceiveMethods(magic);
        redrawSlotContents(this, this.getPropertyNameOfItem(magic));
    }

    applyOnMagicReceiveMethods(magic) {
        for (const eq of this.getEquipment()) {
            if (eq && eq.onMagicReceive) {
                eq.onMagicReceive(magic, this);
            }
        }
    }

    applyNextLevelMethods() {
        for (const eq of this.getEquipment()) {
            if (eq && eq.onNextLevel) {
                eq.onNextLevel();
            }
        }
        for (const mg of this.getMagic()) {
            if (mg && mg.type !== MAGIC_TYPE.NECROMANCY) mg.uses = mg.maxUses;
        }
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

    releaseMagic() {
        for (const mg of this.getMagic()) {
            if (mg && mg.release) {
                const magicResult = mg.release();
                if (magicResult === true) {
                    const pn = this.getPropertyNameOfItem(mg);
                    if (pn) redrawSlotContents(this, pn);
                    return true;
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
        if (this.secondHand && this.secondHand.exhausted) {
            this.secondHand = null;
            redrawSecondHand(this);
        }
        //redrawSlotContentsForPlayer(this);
    }

    activateShield() {
        if (!this.secondHand || this.secondHand.equipmentType !== EQUIPMENT_TYPE.SHIELD) return false;
        if (this.secondHand.activate(this)) {
            this.shielded = true;
            this.spinItem(this.secondHand);
        } else return false;
    }

    spinItem(item, animationTime = 20, fullSpinTimes = 1) {
        this.animationCounter = 0;
        const step = 360 * fullSpinTimes / animationTime;
        const itemSprite = new PIXI.Sprite(item.texture);
        itemSprite.anchor.set(0.5, 0.5);
        itemSprite.position.set(this.tilePosition.x * Game.TILESIZE + Game.TILESIZE / 2, this.tilePosition.y * Game.TILESIZE + Game.TILESIZE / 2);
        itemSprite.width = Game.TILESIZE * 0.9;
        itemSprite.height = Game.TILESIZE * 0.9;
        itemSprite.zIndex = 1;
        Game.world.addChild(itemSprite);

        this.cancelAnimation();
        this.animationSubSprites.push(itemSprite);
        this.animation = () => {
            itemSprite.angle += step;
            this.animationCounter++;
            if (this.animationCounter >= animationTime) {
                this.cancelAnimation();
            }
        };
        Game.APP.ticker.add(this.animation);
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
}