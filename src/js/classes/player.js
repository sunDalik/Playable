"use strict";

class Player extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 4;
        this.maxhealth = 4;
        this.atkBase = 0;
        this.atkMul = 1;
        this.atk = Math.round(this.atkBase * this.atkMul * 4) / 4;
        this.defBase = 0;
        this.defMul = 1;
        this.def = Math.round(this.defBase * this.defMul * 4) / 4;
        this.STEP_ANIMATION_TIME = 8;
        this.BUMP_ANIMATION_TIME = 14;
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
                if (isNotAWallOrEnemy(this.tilePosition.x + tileStepX, this.tilePosition.y)) {
                    removePlayerFromGameMap(this);
                    this.stepX(tileStepX);
                    placePlayerOnGameMap(this);
                } else {
                    this.bumpX(tileStepX);
                }
            } else if (tileStepY !== 0) {
                if (isNotAWallOrEnemy(this.tilePosition.x, this.tilePosition.y + tileStepY)) {
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
        this.def = Math.round(this.defBase * this.defMul * 4) / 4;
    }

    getAtkWithWeapon(weapon) {
        return (Math.round((this.atkBase + weapon.atk) * this.atkMul * 4) / 4)
    }

    stepX(tileStepX) {
        let tileSize = Game.TILESIZE;
        this.tilePosition.x += tileStepX;
        const jumpHeight = tileSize * 25 / 75;
        const a = jumpHeight / ((tileStepX * tileSize / 2) ** 2);
        const b = -(this.position.x + (tileStepX * tileSize) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        const stepX = tileStepX * tileSize / this.STEP_ANIMATION_TIME;
        let counter = 0;

        this.animation = () => {
            this.position.x += stepX;
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            centerCameraX(false);
            counter++;
            if (counter >= this.STEP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
                scaleGameMap();
            }
        };
        Game.APP.ticker.add(this.animation);
        lightPlayerPosition(this);
    }

    bumpX(tileStepX) {
        const jumpHeight = Game.TILESIZE * 25 / 75;
        const a = jumpHeight / ((tileStepX * Game.TILESIZE / 2) ** 2);
        const b = -(this.position.x + (tileStepX * Game.TILESIZE / 2) / 2) * 2 * a;
        const c = (4 * a * (this.position.y - jumpHeight) - (b ** 2) + 2 * (b ** 2)) / (4 * a);
        const stepX = tileStepX * Game.TILESIZE / this.BUMP_ANIMATION_TIME;
        let counter = 0;

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            if (counter < this.BUMP_ANIMATION_TIME / 2) {
                this.position.x += stepX;
            } else {
                this.position.x -= stepX;
            }
            this.position.y = a * (this.position.x ** 2) + b * this.position.x + c;
            counter++;
            if (counter >= this.BUMP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    stepY(tileStepY) {
        let tileSize = Game.TILESIZE;
        this.tilePosition.y += tileStepY;
        let counter = 0;
        const oldPosition = this.position.y;
        let x = 0;
        let P0, P1, P2, P3;
        if (tileStepY < 0) {
            P0 = 0.17;
            P1 = 0.89;
            P2 = 0.84;
            P3 = 1.24;
        } else {
            P0 = 0.42;
            P1 = -0.37;
            P2 = 0.97;
            P3 = 0.75;
        }

        this.animation = () => {
            x += 1 / this.STEP_ANIMATION_TIME;
            this.position.y = oldPosition + cubicBezier(x, P0, P1, P2, P3) * tileSize * tileStepY;
            centerCameraY(false);
            counter++;
            if (counter >= this.STEP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
                scaleGameMap();
            }
        };
        Game.APP.ticker.add(this.animation);
        lightPlayerPosition(this);
    }

    bumpY(tileStepY) {
        let counter = 0;
        const oldPosition = this.position.y;
        let newPosition = null;
        let x = 0;
        let P0, P1, P2, P3;
        if (tileStepY < 0) {
            P0 = 0.17;
            P1 = 0.89;
            P2 = 0.84;
            P3 = 1.24;
        } else {
            P0 = 0.42;
            P1 = -0.37;
            P2 = 0.97;
            P3 = 0.75;
        }

        Game.APP.ticker.remove(this.animation);
        this.animation = () => {
            x += 1 / this.BUMP_ANIMATION_TIME;
            if (counter < this.BUMP_ANIMATION_TIME / 2) {
                this.position.y = oldPosition + cubicBezier(x, P0, P1, P2, P3) * Game.TILESIZE / 2 * tileStepY;
                newPosition = this.position.y;
            } else {
                this.position.y = newPosition - cubicBezier(x, P0, P1, P2, P3) * Game.TILESIZE / 2 * tileStepY;
            }
            counter++;
            if (counter >= this.BUMP_ANIMATION_TIME) {
                Game.APP.ticker.remove(this.animation);
                this.place();
            }
        };
        Game.APP.ticker.add(this.animation);
    }

    damage(atk) {
        if (!this.dead) {
            let dmg = atk - this.def;
            if (dmg < 0.25) dmg = 0.25;
            this.health -= dmg;
            redrawHealthForPlayer(this);
            if (this.health <= 0) {
                this.dead = true;
                Game.gameWorld.removeChild(this);
                if (Game.gameMap[this.tilePosition.y][this.tilePosition.x].secondaryEntity !== null) {
                    Game.gameMap[this.tilePosition.y][this.tilePosition.x].entity = Game.gameMap[this.tilePosition.y][this.tilePosition.x].secondaryEntity;
                    Game.gameMap[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
                } else Game.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;
                Game.TILESIZE = Game.REFERENCE_TILESIZE;
                redrawTiles();
            }
        }
    }

    heal(healHP) {
        if (!this.dead) {
            this.health += healHP;
            if (this.health > this.maxhealth) {
                this.health = this.maxhealth;
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
}