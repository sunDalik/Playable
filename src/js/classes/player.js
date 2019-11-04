"use strict";

class Player extends AnimatedTileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 4;
        this.maxHealth = 4;
        this.atkBase = 0;
        this.atkMul = 1;
        this.atk = Math.round(this.atkBase * this.atkMul * 4) / 4;
        this.defBase = 0;
        this.defMul = 1;
        this.def = Math.round(this.defBase * this.defMul * 4) / 4;
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
        scaleGameMap();
    }

    move(tileStepX, tileStepY, event) {
        if (event.shiftKey || this.weapon === null || this.weapon.attack(this, tileStepX, tileStepY) === false) {
            if (tileStepX !== 0) {
                if (isInanimate(this.tilePosition.x + tileStepX, this.tilePosition.y)) {
                    const entity = Game.map[this.tilePosition.y][this.tilePosition.x + tileStepX].entity;
                    switch (entity.type) {
                        case INANIMATE_TYPE.STATUE:
                            if (!entity.marauded) Game.maraudedStatues.push(entity.weapon);
                            const temp = entity.weapon;
                            entity.weapon = this.weapon;
                            this.weapon = temp;
                            entity.updateTexture();
                            redrawSlotsForPlayer(this);
                            this.bumpX(tileStepX);
                            entity.maraud();
                            break;
                        case INANIMATE_TYPE.OBELISK:

                            break;
                    }
                } else if (isRelativelyEmpty(this.tilePosition.x + tileStepX, this.tilePosition.y)) {
                    removePlayerFromGameMap(this);
                    this.stepX(tileStepX);
                    placePlayerOnGameMap(this);
                } else {
                    this.bumpX(tileStepX);
                }
            } else if (tileStepY !== 0) {
                if (isInanimate(this.tilePosition.x, this.tilePosition.y + tileStepY)) {
                    const entity = Game.map[this.tilePosition.y + tileStepY][this.tilePosition.x].entity;
                    switch (entity.type) {
                        case INANIMATE_TYPE.STATUE:
                            if (!entity.marauded) Game.maraudedStatues.push(entity.weapon);
                            const temp = entity.weapon;
                            entity.weapon = this.weapon;
                            this.weapon = temp;
                            entity.updateTexture();
                            redrawSlotsForPlayer(this);
                            this.bumpY(tileStepY);
                            entity.maraud();
                            break;
                        case INANIMATE_TYPE.OBELISK:

                            break;
                    }
                } else if (isRelativelyEmpty(this.tilePosition.x, this.tilePosition.y + tileStepY)) {
                    removePlayerFromGameMap(this);
                    this.stepY(tileStepY);
                    placePlayerOnGameMap(this);
                } else {
                    this.bumpY(tileStepY);
                }
            }
        }
    }

    setStats(atkBase, atkMul, defBase, defMul) {
        this.atkBase = atkBase;
        this.atkMul = atkMul;
        this.atk = Math.round(this.atkBase * this.atkMul * 4) / 4;
        this.defBase = defBase;
        this.defMul = defMul;
        this.def = this.getDef();
    }

    getAtkWithWeapon(weapon) {
        //todo: for each equipment add atk to base if has atk
        return (Math.round((this.atkBase + weapon.atk) * this.atkMul * 4) / 4)
    }

    getDef() {
        const defEquipment = [this.headwear, this.armor, this.footwear, this.secondHand];
        let defBase = this.defBase;
        for (const equipment of defEquipment) {
            if (equipment !== null) {
                defBase += equipment.def;
            }
        }
        return (Math.round(defBase * this.defMul * 4) / 4)
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
            redrawHealthForPlayer(this);
            if (this.health <= 0) {
                this.dead = true;
                Game.world.removeChild(this);
                if (Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity !== null) {
                    Game.map[this.tilePosition.y][this.tilePosition.x].entity = Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity;
                    Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
                } else Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
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
}