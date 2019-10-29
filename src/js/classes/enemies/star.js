"use strict";

class Star extends Enemy {
    constructor(tilePositionX = 0, tilePositionY = 0, texture = GameState.resources["src/images/enemies/star.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 2;
        this.triggered = false;
        this.triggeredDirections = null;
        this.SHAKE_ANIMATION_TIME = 4;
        this.entityType = ENEMY_TYPE.STAR;
        this.turnDelay = 0;
    }

    move() {
        if (this.turnDelay === 0) {
            if (this.triggered) this.attack();
            else {
                loop: for (let offset = -2; offset <= 2; offset++) {
                    for (let sign = -1; sign <= 1; sign += 2) {
                        if (offset !== 0) {
                            const player = getPlayerOnTile(this.tilePosition.x + offset, this.tilePosition.y + offset * sign);
                            if (player !== null) {
                                this.triggered = true;
                                this.triggeredDirections = DIRECTIONS.DIAGONAL;
                                break loop;
                            }
                        }
                    }
                }
                loop2: for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (Math.abs(x) !== Math.abs(y)) {
                            const player = getPlayerOnTile(this.tilePosition.x + x, this.tilePosition.y + y);
                            if (player !== null) {
                                this.triggered = true;
                                this.triggeredDirections = DIRECTIONS.CARDINAL;
                                break loop2;
                            }
                        }
                    }
                }
                if (this.triggered) this.shake();
            }
        } else this.turnDelay--;
    }

    shake() {
        let counter = 0;
        let step = GameState.TILESIZE / 20 / (this.SHAKE_ANIMATION_TIME / 2);
        let direction = -1;
        this.animation = () => {
            if (counter < this.SHAKE_ANIMATION_TIME / 2) {
                this.position.x += step * direction;
                counter++;
            } else if (counter < this.SHAKE_ANIMATION_TIME) {
                this.position.x -= step * direction;
                counter++;
            } else {
                counter = 0;
                direction *= -1;
                this.place();
            }
        };
        GameState.APP.ticker.add(this.animation);
    }

    attack() {
        this.triggered = false;
        if (this.triggeredDirections === DIRECTIONS.CARDINAL) {
            this.attackTileAtOffset(0, 1);
            this.attackTileAtOffset(1, 0);
            this.attackTileAtOffset(0, -1);
            this.attackTileAtOffset(-1, 0);
        } else if (this.triggeredDirections === DIRECTIONS.DIAGONAL) {
            this.attackTileAtOffset(-2, -2);
            this.attackTileAtOffset(-1, -1);
            this.attackTileAtOffset(2, 2);
            this.attackTileAtOffset(1, 1);
            this.attackTileAtOffset(-2, 2);
            this.attackTileAtOffset(-1, 1);
            this.attackTileAtOffset(2, -2);
            this.attackTileAtOffset(1, -1);
        }
        this.turnDelay = 1;
    }

    attackTileAtOffset(tileOffsetX, tileOffsetY) {
        const attackPositionX = this.tilePosition.x + tileOffsetX;
        const attackPositionY = this.tilePosition.y + tileOffsetY;
        if (isNotAWall(attackPositionX, attackPositionY) && !isEnemy(attackPositionX, attackPositionY)) {
            createFadingAttack(new TileElement(GameState.resources["src/images/enemy_attack.png"].texture, attackPositionX, attackPositionY));
            const player = getPlayerOnTile(attackPositionX, attackPositionY);
            if (player !== null) damagePlayer(player, 1);
        }
    }
}