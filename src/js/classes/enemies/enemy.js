import {Game} from "../../game";
import * as PIXI from "pixi.js";
import {AnimatedTileElement} from "../tile_elements/animated_tile_element";
import {HAZARD_TYPE, ROLE, STAGE} from "../../enums/enums";
import {getHealthArray, getHeartTexture, removeAllChildrenFromContainer} from "../../drawing/draw_utils";
import {runDestroyAnimation} from "../../animations";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import {IntentsSpriteSheet} from "../../loader";
import {removeObjectFromArray} from "../../utils/basic_utils";
import {dropItem} from "../../game_logic";
import {DAMAGE_TYPE} from "../../enums/damage_type";

export class Enemy extends AnimatedTileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.dead = false;
        this.role = ROLE.ENEMY;
        this.boss = false;
        this.cancellable = true;
        this.canMoveInvisible = false;
        this.stun = 0;
        this.atk = 0;
        this.fireImmunity = 1;
        this.poisonImmunity = 1;
        this.electricityImmunity = 1;
        this.onAnimationEnd = null;
        this.movable = true;
        this.fadingDestructionParticles = false;
        this.drop = null;
        this.isMinion = false;
        this.healthContainer = new PIXI.Container();
        Game.world.addChild(this.healthContainer);
        this.healthContainer.visible = false;
        this.healthContainer.zIndex = 5000;
        this.intentIcon = this.createIntentIcon();
        this.place();
        this.setOwnZIndex(Z_INDEXES.ENEMY);
    }

    move() {}

    correctZIndex() {
        super.correctZIndex();
        if (this.intentIcon) this.intentIcon.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.INTENT;
        if (this.intentIcon2) this.intentIcon2.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.INTENT;
    }

    cancelAnimation() {
        if (this.onAnimationEnd) {
            const toCall = this.onAnimationEnd;
            this.onAnimationEnd = null;
            toCall();
        }
        super.cancelAnimation();
    }

    place() {
        super.place();
        if (this.healthContainer) {
            this.onMoveFrame();
        }
    }

    // if your weapon deals stun damage: first call addStun and THEN damage the enemy
    setStun(stun) {
        this.stun = stun;
        this.setStunIcon();
    }

    // just an alias
    addStun(stun) {
        this.setStun(this.stun + stun);
    }

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        if (dmg === 0) return;
        if (!this.dead) {
            this.health -= dmg;
            if (this.health <= 0) {
                this.die(source);
            } else {
                this.runHitAnimation();
                this.healthContainer.visible = true;
                this.redrawHealth();
            }
        }
    }

    damageWithHazards() {
        const hazard = Game.map[this.tilePosition.y][this.tilePosition.x].hazard;
        if (hazard) {
            if (hazard.type === HAZARD_TYPE.POISON && this.poisonImmunity <= 0) {
                this.damage(hazard, hazard.atk, 0, 0, DAMAGE_TYPE.HAZARDAL);
            } else if (hazard.type === HAZARD_TYPE.FIRE && this.fireImmunity <= 0) {
                this.damage(hazard, hazard.atk, 0, 0, DAMAGE_TYPE.HAZARDAL);
            } else if (hazard.type === HAZARD_TYPE.DARK_FIRE || hazard.type === HAZARD_TYPE.DARK_POISON) {
                this.damage(hazard, hazard.atk, 0, 0, DAMAGE_TYPE.HAZARDAL);
            }
        }
    }

    onMoveFrame() {
        this.healthContainer.position.x = this.position.x - getHealthArray(this).slice(0, 5).length * (Game.TILESIZE / 65 * 20 + 0) / 2 + 0 / 2;
        this.healthContainer.position.y = this.position.y + this.texture.frame.height * this.scale.y / 2 + 10;

        this.intentIcon.position.x = this.position.x;
        this.intentIcon.position.y = this.position.y - this.height / 2 - this.intentIcon.height / 2;
        if (this.intentIcon2) {
            this.intentIcon2.position.x = this.intentIcon.position.x;
            this.intentIcon2.position.y = this.intentIcon.position.y;
        }
        this.placeShadow();
    }

    redrawHealth() {
        removeAllChildrenFromContainer(this.healthContainer);
        const heartSize = Game.TILESIZE / 65 * 20;
        const heartRowOffset = 0;
        const heartColOffset = 0;
        const healthArray = getHealthArray(this);
        for (let i = 0; i < healthArray.length; ++i) {
            const heart = new PIXI.Sprite(getHeartTexture(healthArray[i]));
            heart.width = heartSize;
            heart.height = heartSize;
            heart.position.y = (heartRowOffset + heartSize) * Math.floor(i / 5);
            heart.position.x = (i % 5) * (heartColOffset + heartSize);
            this.healthContainer.addChild(heart);
        }
    }

    die(source) {
        if (this.dead) return;
        if (source === Game.player || source === Game.BOTH_PLAYERS) {
            for (const eq of Game.player.getEquipment()) {
                if (eq && eq.onKill) eq.onKill(Game.player, this);
            }
        }
        if (source === Game.player2 || source === Game.BOTH_PLAYERS) {
            for (const eq of Game.player2.getEquipment()) {
                if (eq && eq.onKill) eq.onKill(Game.player2, this);
            }
        }
        this.dead = true;
        this.removeFromMap();
        this.runDestroyAnimation();
        this.cancelAnimation();
        if (this.animation) Game.app.ticker.remove(this.animation);
        this.visible = false;
        this.healthContainer.visible = false;
        this.intentIcon.visible = false;
        if (this.intentIcon2) this.intentIcon2.visible = false;
        if (this.maskLayer && Game.stage === STAGE.DARK_TUNNEL) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        }

        if (this.drop) {
            dropItem(this.drop, this.tilePosition.x, this.tilePosition.y);
            this.drop = null;
        }
        Game.world.removeChild(this.shadow);
        this.shadow = null;
        if (this.isMinion) removeObjectFromArray(this, Game.enemies);
    }

    runDestroyAnimation() {
        runDestroyAnimation(this);
    }

    heal(healHP) {
        if (!this.dead) {
            this.health += healHP;
            if (this.health > this.maxHealth) {
                this.health = this.maxHealth;
            }
            this.redrawHealth();
        }
    }

    revive() {
        if (Game.map[this.tilePosition.y][this.tilePosition.x].entity === null) {
            this.drop = null;
            this.dead = false;
            this.visible = true;
            this.health = this.maxHealth;
            this.redrawHealth();
            this.healthContainer.visible = false;
            this.regenerateShadow();
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
            return true;
        }
        return false;
    }

    removeFromMap() {
        if (this.maskLayer && Game.stage === STAGE.DARK_TUNNEL) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        }
        if (this === Game.map[this.tilePosition.y][this.tilePosition.x].entity) {
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity;
            Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
        } else if (this === Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity) {
            Game.map[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
        }
    }

    placeOnMap() {
        if (!this.dead) {
            if (this.maskLayer && Game.stage === STAGE.DARK_TUNNEL) {
                Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
            }
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
    }

    step(tileStepX, tileStepY, onFrame = null, onEnd = null) {
        super.step(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            this.onMoveFrame();
        }, onEnd);
    }

    bump(tileStepX, tileStepY, onFrame = null, onEnd = null) {
        super.bump(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            this.onMoveFrame();
        }, onEnd);
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        super.slide(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            this.onMoveFrame();
        }, onEnd, animationTime);
    }

    slideBump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        super.slideBump(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            this.onMoveFrame();
        }, onEnd, animationTime);
    }

    updateIntentIcon() {
        this.intentIcon.visible = !this.dead;
    }

    setStunIcon() {
        this.intentIcon.visible = !this.dead;
        this.intentIcon.texture = IntentsSpriteSheet["stun.png"];
        this.intentIcon.angle = 0;
        if (this.intentIcon2) this.intentIcon2.visible = false;
    }

    createIntentIcon() {
        const intentIcon = new PIXI.Sprite(PIXI.Texture.WHITE);
        Game.world.addChild(intentIcon);
        intentIcon.visible = false;
        intentIcon.width = intentIcon.height = 25;
        intentIcon.anchor.set(0.5, 0.5);
        return intentIcon;
    }
}