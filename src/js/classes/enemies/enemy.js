import {Game} from "../../game"
import * as PIXI from "pixi.js"
import {AnimatedTileElement} from "../tile_elements/animated_tile_element"
import {HAZARD_TYPE, ROLE, STAGE} from "../../enums";
import {getHealthArray, getHeartTexture, removeAllChildrenFromContainer} from "../../drawing/draw_utils";
import {redrawEnergy} from "../../drawing/draw_hud";
import {LyingItem} from "../equipment/lying_item";
import {get8Directions} from "../../utils/map_utils";
import {isInanimate, isNotAWall} from "../../map_checks";
import {runDestroyAnimation} from "../../animations";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";

export class Enemy extends AnimatedTileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.dead = false;
        this.role = ROLE.ENEMY;
        this.boss = false;
        this.cancellable = true;
        this.canMoveInvisible = false;
        this.stun = 0;
        this.fireImmunity = 1;
        this.poisonImmunity = 1;
        this.electricityImmunity = 1;
        this.onAnimationEnd = null;
        this.movable = true;
        this.energyDrop = undefined;
        this.fadingDestructionParticles = false;
        this.drop = null;
        this.healthContainer = new PIXI.Container();
        Game.world.addChild(this.healthContainer);
        this.healthContainer.visible = false;
        this.healthContainer.zIndex = 5000;
        this.intentIcon = this.createIntentIcon();
        this.place();
        this.ownZIndex = Z_INDEXES.ENEMY;
    }

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
            this.moveHealthContainer();
        }
    }

    damage(source, dmg, inputX = 0, inputY = 0, magical = false, hazardDamage = false) {
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
                this.damage(hazard, hazard.atk, 0, 0, false, true);
            } else if (hazard.type === HAZARD_TYPE.FIRE && this.fireImmunity <= 0) {
                this.damage(hazard, hazard.atk, 0, 0, false, true);
            } else if (hazard.type === HAZARD_TYPE.DARK_FIRE || hazard.type === HAZARD_TYPE.DARK_POISON) {
                this.damage(hazard, hazard.atk, 0, 0, false, true);
            }
        }
    }

    moveHealthContainer() {
        this.healthContainer.position.x = this.position.x - getHealthArray(this).slice(0, 5).length * (Game.TILESIZE / 65 * 20 + 0) / 2 + 0 / 2;
        this.healthContainer.position.y = this.position.y + this.height * 0.5 + 10;

        this.intentIcon.position.x = this.position.x;
        this.intentIcon.position.y = this.position.y - this.height / 2 - this.intentIcon.height / 2;
        if (this.intentIcon2) {
            this.intentIcon2.position.x = this.intentIcon.position.x;
            this.intentIcon2.position.y = this.intentIcon.position.y;
        }
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
        let energyDrop;
        if (this.energyDrop === undefined) energyDrop = Math.floor(this.atk + this.maxHealth / 2);
        else energyDrop = this.energyDrop;
        if (source === Game.player) Game.lightEnergy += energyDrop;
        else if (source === Game.player2) Game.darkEnergy += energyDrop;
        else if (source === Game.BOTH_PLAYERS) {
            //not yet sure about the exact formula...
            Game.lightEnergy += energyDrop;
            Game.darkEnergy += energyDrop;
        }

        if (source === Game.player || source === Game.BOTH_PLAYERS) {
            for (const eq of Game.player.getEquipment()) {
                if (eq && eq.onKill) eq.onKill(Game.player);
            }
        }
        if (source === Game.player2 || source === Game.BOTH_PLAYERS) {
            for (const eq of Game.player2.getEquipment()) {
                if (eq && eq.onKill) eq.onKill(Game.player2);
            }
        }

        redrawEnergy();
        this.dead = true;
        this.removeFromMap();
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
            if (Game.map[this.tilePosition.y][this.tilePosition.x].item === null) {
                const item = new LyingItem(this.tilePosition.x, this.tilePosition.y, this.drop);
                Game.map[this.tilePosition.y][this.tilePosition.x].item = item;
                Game.world.addChild(item);
            } else {
                for (const dir of get8Directions()) {
                    const posY = this.tilePosition.y + dir.y;
                    const posX = this.tilePosition.x + dir.x;
                    if (isNotAWall(posX, posY) && !isInanimate(posX, posY) && Game.map[posY][posX].item === null) {
                        const item = new LyingItem(posX, posY, this.drop);
                        Game.map[posY][posX].item = item;
                        Game.world.addChild(item);
                        break;
                    }
                    //else? what will we do if all 8 tiles are busy? think about it later...
                }
            }
            this.drop = null;
        }
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
            this.energyDrop = 0;
            this.drop = null;
            this.dead = false;
            this.visible = true;
            this.health = this.maxHealth;
            this.redrawHealth();
            this.healthContainer.visible = false;
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
            return true;
        }
        return false;
    }

    getPathToPlayer1() {
        return Game.finder.findPath(this.tilePosition.x, this.tilePosition.y,
            Game.player.tilePosition.x, Game.player.tilePosition.y, Game.levelGraph.clone());
    }

    getPathToPlayer2() {
        return Game.finder.findPath(this.tilePosition.x, this.tilePosition.y,
            Game.player2.tilePosition.x, Game.player2.tilePosition.y, Game.levelGraph.clone());
    }

    canSeePlayers() {
        let distanceToPlayer1;
        if (Game.player.dead) distanceToPlayer1 = [];
        else distanceToPlayer1 = Game.finder.findPath(this.tilePosition.x, this.tilePosition.y,
            Game.player.tilePosition.x, Game.player.tilePosition.y, Game.playerDetectionGraph.clone());
        let distanceToPlayer2;
        if (Game.player2.dead) distanceToPlayer2 = [];
        else distanceToPlayer2 = Game.finder.findPath(this.tilePosition.x, this.tilePosition.y,
            Game.player2.tilePosition.x, Game.player2.tilePosition.y, Game.playerDetectionGraph.clone());
        return distanceToPlayer1.length !== 0 || distanceToPlayer2.length !== 0;
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
            this.moveHealthContainer();
        }, onEnd);
    }

    bump(tileStepX, tileStepY, onFrame = null, onEnd = null) {
        super.bump(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            this.moveHealthContainer()
        }, onEnd);
    }

    slide(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        super.slide(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            this.moveHealthContainer()
        }, onEnd, animationTime);
    }

    slideBump(tileStepX, tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        super.slideBump(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            this.moveHealthContainer()
        }, onEnd, animationTime);
    }

    updateIntentIcon() {
        this.intentIcon.visible = !this.dead;
    }

    setStunIcon() {
        this.intentIcon.visible = !this.dead;
        this.intentIcon.texture = Game.resources["src/images/icons/intents/stun.png"].texture;
        this.intentIcon.angle = 0;
        if (this.intentIcon2) this.intentIcon2.visible = false;
    }

    getArrowRightAngleForDirection(direction) {
        if (direction.x === -1 && direction.y === 0) return 180;
        else if (direction.x === 1 && direction.y === 0) return 0;
        else if (direction.x === 0 && direction.y === -1) return -90;
        else if (direction.x === 0 && direction.y === 1) return 90;
        else if (direction.x === 1 && direction.y === 1) return 45;
        else if (direction.x === 1 && direction.y === -1) return -45;
        else if (direction.x === -1 && direction.y === 1) return 135;
        else if (direction.x === -1 && direction.y === -1) return -135;
    }

    createIntentIcon() {
        const intentIcon = new PIXI.Sprite(PIXI.Texture.WHITE);
        Game.world.addChild(intentIcon);
        intentIcon.visible = false;
        intentIcon.zIndex = Game.primaryPlayer.zIndex + 2;
        intentIcon.width = intentIcon.height = 25;
        intentIcon.anchor.set(0.5, 0.5);
        return intentIcon;
    }
}