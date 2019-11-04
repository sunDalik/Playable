"use strict";

class Enemy extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.dead = false;
        this.role = ROLE.ENEMY;
        this.STEP_ANIMATION_TIME = 8;
        this.cancellable = true;
        this.healthContainer = new PIXI.Container();
        Game.gameWorld.addChild(this.healthContainer);
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

    damage(health) {
        this.health -= health;
        if (this.health <= 0) this.dead = true;
        this.healthContainer.visible = true;
        this.redrawHealth();
    }

    moveHealthContainer() {
        this.healthContainer.position.x = this.position.x - getHealthArray(this).length * (20 + 5) / 2 + 5 / 2;
        this.healthContainer.position.y = this.position.y + this.height * 0.5 + 10;
    }

    redrawHealth() {
        removeAllChildrenFromContainer(this.healthContainer);
        const heartSize = 20;
        const heartRowOffset = 0;
        const heartColOffset = 5;
        const healthArray = getHealthArray(this);
        for (let i = 0; i < healthArray.length; ++i) {
            let heart;
            switch (healthArray[i]) {
                case 1:
                    heart = new PIXI.Sprite(Game.resources["src/images/HUD/heart_full.png"].texture);
                    break;

                case 0.75:
                    heart = new PIXI.Sprite(Game.resources["src/images/HUD/heart_75.png"].texture);
                    break;

                case 0.5:
                    heart = new PIXI.Sprite(Game.resources["src/images/HUD/heart_half.png"].texture);
                    break;

                case 0.25:
                    heart = new PIXI.Sprite(Game.resources["src/images/HUD/heart_25.png"].texture);
                    break;

                case 0:
                    heart = new PIXI.Sprite(Game.resources["src/images/HUD/heart_empty.png"].texture);
                    break;

                default:
                    heart = new PIXI.Sprite(Game.resources["src/images/void.png"].texture);
                    break;
            }
            heart.width = heartSize;
            heart.height = heartSize;
            heart.position.y = (heartRowOffset + heartSize) * Math.floor(i / 5);
            heart.position.x = (i % 5) * (heartColOffset + heartSize);
            this.healthContainer.addChild(heart);
        }
    }

    isDead() {
        return this.dead;
    }

    die() {
        Game.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;
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
}