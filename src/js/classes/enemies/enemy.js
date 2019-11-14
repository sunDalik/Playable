import {Game} from "../../game"
import * as PIXI from "pixi.js"
import {AnimatedTileElement} from "../animated_tile_element"
import {ROLE} from "../../enums";
import {getHealthArray, getHeartTexture} from "../../draw";
import {removeAllChildrenFromContainer} from "../../utils";

export class Enemy extends AnimatedTileElement {
    constructor(texture, tilePositionX, tilePositionY) {
        super(texture, tilePositionX, tilePositionY);
        this.dead = false;
        this.role = ROLE.ENEMY;
        this.cancellable = true;
        this.stun = 0;
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

    damage(dmg, inputX = 0, inputY = 0, magical = false) {
        if (!this.dead) {
            this.health -= dmg;
            if (this.health <= 0) {
                this.die();
            } else {
                this.healthContainer.visible = true;
                this.redrawHealth();
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

    die() {
        this.dead = true;
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
        this.cancelAnimation();
        this.visible = false;
        this.healthContainer.visible = false;
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

    updateMapPosition() {
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

    bumpY(tileStepY) {
        super.bumpY(tileStepY, () => this.moveHealthContainer())
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