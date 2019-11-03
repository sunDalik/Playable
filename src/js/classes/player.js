"use strict";

class Player extends TileElement {
    constructor(texture, tilePositionX = 0, tilePositionY = 0) {
        super(texture, tilePositionX, tilePositionY);
        this.health = 9.75;
        this.maxhealth = 10;
        this.atkBase = 1;
        this.atkMul = 1;
        this.atk = Math.round(this.atkBase * this.atkMul * 4) / 4;
        this.defBase = 1;
        this.defMul = 1;
        this.def = Math.round(this.defBase * this.defMul * 4) / 4;
        this.STEP_ANIMATION_TIME = 8;
        this.role = ROLE.PLAYER;
        this.dead = false;
        this.weapon = WEAPON_TYPE.NONE;
        this.secondHand = WEAPON_TYPE.NONE;
        this.headwear = HEAD_TYPE.NONE;
        this.armor = ARMOR_TYPE.NONE;
        this.footwear = FOOTWEAR_TYPE.NONE;
        this.magic1 = MAGIC_TYPE.NONE;
        this.magic2 = MAGIC_TYPE.NONE;
        this.magic3 = MAGIC_TYPE.NONE;
        this.magic4 = MAGIC_TYPE.NONE;
    }

    cancelAnimation() {
        super.cancelAnimation();
        scaleGameMap();
    }

    setMovedTexture() {
        if (this === GameState.player) this.texture = GameState.resources["src/images/player_moved.png"].texture;
        else this.texture = GameState.resources["src/images/player2_moved.png"].texture;
    }

    setUnmovedTexture() {
        if (this === GameState.player) this.texture = GameState.resources["src/images/player.png"].texture;
        else this.texture = GameState.resources["src/images/player2.png"].texture;
    }

    setStats(atkBase, atkMul, defBase, defMul) {
        this.atkBase = atkBase;
        this.atkMul = atkMul;
        this.atk = Math.round(this.atkBase * this.atkMul * 4) / 4;
        this.defBase = defBase;
        this.defMul = defMul;
        this.def = Math.round(this.defBase * this.defMul * 4) / 4;
    }

    stepX(tileStepX) {
        let tileSize = GameState.TILESIZE;
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
                GameState.APP.ticker.remove(this.animation);
                this.place();
                scaleGameMap();
            }
        };
        GameState.APP.ticker.add(this.animation);
        lightPlayerPosition(this);
    }

    stepY(tileStepY) {
        let tileSize = GameState.TILESIZE;
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
                GameState.APP.ticker.remove(this.animation);
                this.place();
                scaleGameMap();
            }
        };
        GameState.APP.ticker.add(this.animation);
        lightPlayerPosition(this);
    }

    attack(tileRangeX, tileRangeY) {
        const attackTileX = this.tilePosition.x + tileRangeX;
        const attackTileY = this.tilePosition.y + tileRangeY;
        createWeaponAnimation(this.tilePosition.x, this.tilePosition.y, attackTileX, attackTileY);
        attackTile(attackTileX, attackTileY, this.atk, tileRangeX, tileRangeY);
    }

    damage(atk) {
        if (!this.dead) {
            let dmg = atk - this.def;
            if (dmg < 0.25) dmg = 0.25;
            this.health -= dmg;
            redrawHealthForPlayer(this);
            if (this.health <= 0) {
                this.dead = true;
                GameState.gameWorld.removeChild(this);
                if (GameState.gameMap[this.tilePosition.y][this.tilePosition.x].secondaryEntity !== null) {
                    GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = GameState.gameMap[this.tilePosition.y][this.tilePosition.x].secondaryEntity;
                    GameState.gameMap[this.tilePosition.y][this.tilePosition.x].secondaryEntity = null;
                } else GameState.gameMap[this.tilePosition.y][this.tilePosition.x].entity = null;
                GameState.TILESIZE = GameState.REFERENCE_TILESIZE;
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
}