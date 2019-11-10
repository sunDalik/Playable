"use strict";

class Enemy extends AnimatedTileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
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
        const start = Game.levelGraph.grid[this.tilePosition.y][this.tilePosition.x];
        const end = Game.levelGraph.grid[Game.player.tilePosition.y][Game.player.tilePosition.x];
        return astar.search(Game.levelGraph, start, end);
    }

    getPathToPlayer2() {
        const start = Game.levelGraph.grid[this.tilePosition.y][this.tilePosition.x];
        const end = Game.levelGraph.grid[Game.player2.tilePosition.y][Game.player2.tilePosition.x];
        return astar.search(Game.levelGraph, start, end);
    }

    canSeePlayers() {
        const start = Game.playerDetectionGraph.grid[this.tilePosition.y][this.tilePosition.x];
        let end = Game.playerDetectionGraph.grid[Game.player.tilePosition.y][Game.player.tilePosition.x];
        const distanceToPlayer1 = astar.search(Game.playerDetectionGraph, start, end);
        end = Game.playerDetectionGraph.grid[Game.player2.tilePosition.y][Game.player2.tilePosition.x];
        const distanceToPlayer2 = astar.search(Game.playerDetectionGraph, start, end);
        return distanceToPlayer1.length !== 0 || distanceToPlayer2.length !== 0;
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

    slideX(tileStepX, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        super.slideX(tileStepX, () => {
            if (onFrame) onFrame();
            this.moveHealthContainer()
        }, onEnd, animationTime);
    }

    slideY(tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        super.slideY(tileStepY, () => {
            if (onFrame) onFrame();
            this.moveHealthContainer()
        }, onEnd, animationTime);
    }

    slideBumpX(tileStepX, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        super.slideBumpX(tileStepX, () => {
            if (onFrame) onFrame();
            this.moveHealthContainer()
        }, onEnd, animationTime);
    }

    slideBumpY(tileStepY, onFrame = null, onEnd = null, animationTime = this.SLIDE_ANIMATION_TIME) {
        super.slideBumpY(tileStepY, () => {
            if (onFrame) onFrame();
            this.moveHealthContainer()
        }, onEnd, animationTime);
    }
}