import {Game} from "../game"
import {AnimatedTileElement} from "./animated_tile_element";
import {ROLE, INANIMATE_TYPE, TILE_TYPE, EQUIPMENT_TYPE, TOOL_TYPE} from "../enums";
import {scaleGameMap, centerCameraX, centerCameraY} from "../camera";
import {shakeScreen} from "../animations";
import {lightPlayerPosition, redrawHealthForPlayer, redrawSlotsForPlayer, redrawTiles} from "../draw";
import {isInanimate, isRelativelyEmpty, isAWall} from "../mapChecks";
import {calculateDetectionGraph} from "../map_generation"
import {placePlayerOnGameMap, removePlayerFromGameMap, removeTileFromWorld, gotoNextLevel} from "../game_logic";

export class Player extends AnimatedTileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
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
    }

    cancelAnimation() {
        super.cancelAnimation();
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

            redrawSlotsForPlayer(this);
        }
    }

    getMagicById(i) {
        if (i === 1) return this.magic1;
        else if (i === 2) return this.magic2;
        else if (i === 3) return this.magic3;
        else if (i === 4) return this.magic4;
        else return null;
    }

    setMagicById(i, magic) {
        if (i === 1) this.magic1 = magic;
        else if (i === 2) this.magic2 = magic;
        else if (i === 3) this.magic3 = magic;
        else if (i === 4) this.magic4 = magic;
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

    damage(atk) {
        if (!this.dead) {
            let dmg = atk - this.getDef();
            if (dmg < 0.25) dmg = 0.25;
            this.health -= dmg;
            shakeScreen();
            redrawHealthForPlayer(this);
            if (this.health <= 0) {
                this.dead = true;
                this.visible = false;
                removePlayerFromGameMap(this);
                Game.TILESIZE = Game.REFERENCE_TILESIZE;
                redrawTiles();
            }
        }
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

    slideX(tileDirX, SLIDE_ANIMATION_TIME = this.SLIDE_ANIMATION_TIME) {
        super.slideX(tileDirX, () => centerCameraX(false), scaleGameMap, SLIDE_ANIMATION_TIME);
        lightPlayerPosition(this);
    }

    slideY(tileDirY, SLIDE_ANIMATION_TIME = this.SLIDE_ANIMATION_TIME) {
        super.slideY(tileDirY, () => centerCameraY(false), scaleGameMap, SLIDE_ANIMATION_TIME);
        lightPlayerPosition(this);
    }

    interactWithInanimateEntity(entity) {
        switch (entity.type) {
            case INANIMATE_TYPE.STATUE:
                if (!entity.marauded) Game.maraudedStatues.push(entity.weapon);
                const temp = entity.weapon;
                entity.weapon = this.weapon;
                this.weapon = temp;
                entity.updateTexture();
                redrawSlotsForPlayer(this);
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
        redrawSlotsForPlayer(this);
    }
}