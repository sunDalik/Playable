import {Game} from "../../game"
import * as PIXI from "pixi.js"
import {AnimatedTileElement} from "../tile_elements/animated_tile_element"
import {HAZARD_TYPE, ROLE} from "../../enums";
import {getHealthArray, getHeartTexture, removeAllChildrenFromContainer} from "../../drawing/draw_utils";
import {redrawEnergy} from "../../drawing/draw_hud";

export class Enemy extends AnimatedTileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.dead = false;
        this.role = ROLE.ENEMY;
        this.cancellable = true;
        this.stun = 0;
        this.fireImmunity = 1;
        this.poisonImmunity = 1;
        this.movable = true;
        this.energyDrop = undefined;
        this.healthContainer = new PIXI.Container();
        Game.world.addChild(this.healthContainer);
        this.healthContainer.visible = false;
        this.healthContainer.zIndex = 1;
        this.place();
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
        this.healthContainer.position.x = this.position.x - getHealthArray(this).slice(0, 5).length * (Game.TILESIZE / 65 * 20 + 5) / 2 + 5 / 2;
        this.healthContainer.position.y = this.position.y + this.height * 0.5 + 10;
    }

    redrawHealth() {
        removeAllChildrenFromContainer(this.healthContainer);
        const heartSize = Game.TILESIZE / 65 * 20;
        const heartRowOffset = 0;
        const heartColOffset = 5;
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
        this.visible = false;
        this.healthContainer.visible = false;
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
            this.dead = false;
            this.visible = true;
            this.health = this.maxHealth;
            this.redrawHealth();
            this.healthContainer.visible = false;
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
        }
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
        const distanceToPlayer1 = Game.finder.findPath(this.tilePosition.x, this.tilePosition.y,
            Game.player.tilePosition.x, Game.player.tilePosition.y, Game.playerDetectionGraph.clone());
        const distanceToPlayer2 = Game.finder.findPath(this.tilePosition.x, this.tilePosition.y,
            Game.player2.tilePosition.x, Game.player2.tilePosition.y, Game.playerDetectionGraph.clone());
        return distanceToPlayer1.length !== 0 || distanceToPlayer2.length !== 0;
    }

    removeFromMap() {
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
    }

    placeOnMap() {
        if (!this.dead) {
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = this;
        }
    }

    //probably will need to change those so it accepts more parameters and sends them?
    stepX(tileStepX) {
        super.stepX(tileStepX, () => this.moveHealthContainer())
    }

    bumpX(tileStepX) {
        super.bumpX(tileStepX, () => this.moveHealthContainer())
    }

    stepY(tileStepY) {
        super.stepY(tileStepY, () => this.moveHealthContainer())
    }

    stepXY(tileStepX, tileStepY, onFrame = null, onEnd = null) {
        super.stepXY(tileStepX, tileStepY, () => {
            if (onFrame) onFrame();
            this.moveHealthContainer();
        }, onEnd);
    }

    bumpY(tileStepY, onFrame = null, onEnd = null) {
        super.bumpY(tileStepY, () => {
            if (onFrame) onFrame();
            this.moveHealthContainer()
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
}