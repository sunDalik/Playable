import {ENEMY_TYPE, TILE_TYPE} from "../../../enums/enums";
import {Boss} from "./boss";
import {DCEnemiesSpriteSheet} from "../../../loader";
import {randomChoice} from "../../../utils/random_utils";
import {SuperWallTile} from "../../draw/super_wall";
import {WallTile} from "../../draw/wall";
import {Game} from "../../../game";
import {getPlayerOnTile, isEmpty} from "../../../map_checks";
import {getFreeBurrowedDirections} from "../../../utils/map_utils";
import {tileDistanceDiagonal} from "../../../utils/game_utils";
import {BombSkull} from "../dc/bomb_skull";

export class CowardWorm extends Boss {
    constructor(tilePositionX, tilePositionY, texture = DCEnemiesSpriteSheet["desert_worm.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 15;
        this.type = ENEMY_TYPE.COWARD_WORM;
        this.atk = 1;
        this.name = "Coward Worm";

        this.startNoActionCounter = 4;
        this.waitingToMove = false;

        this.triggeredBombSkullSpit = false;
        this.currentBombSkullAmount = this.bombSkullAmount = 3;
        this.bombSkulls = [];

        // copied from desert worm
        this.currentStunDelay = this.stunDelay = 4;
        this.burrowed = true;
        this.SLIDE_ANIMATION_TIME = 8;
        this.removeShadow();
        this.setScaleModifier(1.21); // 312 / 256 = 1.21
        this.setOwnZIndex(-2);

    }

    static getBossRoomStats() {
        return {width: randomChoice([13, 15, 17]), height: randomChoice([9, 11])};
    }

    afterMapGen() {
        Game.burrowedEnemies.push(this);
    }

    immediateReaction() {
        if (this.burrowed) this.removeFromMap();
    }

    placeOnMap() {
        if (!this.burrowed) {
            super.placeOnMap();
        }
    }

    move() {
        if (!this.burrowed) {
            if (this.currentStunDelay <= 0) {
                this.burrowed = true;
                this.texture = DCEnemiesSpriteSheet["desert_worm.png"];
                this.place();
                this.removeFromMap();
            } else this.currentStunDelay--;
        } else if (this.waitingToMove) {
            this.shake(1, 0);
            this.waitingToMove = false;
        } else if (this.triggeredBombSkullSpit) {
            this.spitBombSkulls();
            this.currentBombSkullAmount--;
            if (this.currentBombSkullAmount > 0) {
                this.shake(1, 0);
            } else {
                this.triggeredBombSkullSpit = false;
            }
        } else if (getPlayerOnTile(this.tilePosition.x, this.tilePosition.y) !== null) {
            // run away
        } else {
            let canMove = true;
            let roll = Math.random() * 100;
            if (this.startNoActionCounter > 0) roll = 999;
            if (roll < 5) {
                if (this.canSpawnBombSkulls()) {
                    this.waitingToMove = true;
                    this.triggeredBombSkullSpit = true;
                    this.currentBombSkullAmount = this.bombSkullAmount;
                    this.shake(1, 0);
                    canMove = false;
                }
            }

            if (!canMove) return;
            const movementOptions = getFreeBurrowedDirections(this);
            if (movementOptions.length !== 0) {
                const dir = randomChoice(movementOptions);
                this.slide(dir.x, dir.y);
            }
        }
        this.startNoActionCounter--;
    }

    canSpawnBombSkulls() {
        this.bombSkulls = this.bombSkulls.filter(b => !b.dead);
        return this.bombSkulls.length <= 4;
    }

    spitBombSkulls() {
        const tile = this.getRandomMinionSpawnTile();
        if (tile === undefined) return;
        const bomSkull = new BombSkull(this.tilePosition.x, this.tilePosition.y);
        Game.world.addEnemy(bomSkull);
        this.bombSkulls.push(bomSkull);
        bomSkull.setStun(2);
        bomSkull.step(tile.x - this.tilePosition.x, tile.y - this.tilePosition.y, null, null,
            tileDistanceDiagonal(this, {tilePosition: {x: tile.x, y: tile.y}}, 1) + 2);
    }

    getRandomMinionSpawnTile() {
        const tiles = [];
        for (let x = Game.endRoomBoundaries[0].x; x <= Game.endRoomBoundaries[1].x; x++) {
            for (let y = Game.endRoomBoundaries[0].y; y <= Game.endRoomBoundaries[1].y; y++) {
                if (isEmpty(x, y)) {
                    tiles.push({x: x, y: y});
                }
            }
        }
        return randomChoice(tiles);
    }

    applyRoomLayout(level, room) {
        for (let y = room.offsetY + 2; y <= room.offsetY + room.height - 3; y += 2) {
            for (let x = room.offsetX + 2; x <= room.offsetX + room.width - 3; x += 2) {
                if (Math.random() < 0.7) {
                    level[y][x].tile = new SuperWallTile(x, y);
                    level[y][x].tileType = TILE_TYPE.SUPER_WALL;
                } else {
                    level[y][x].tile = new WallTile(x, y);
                    level[y][x].tileType = TILE_TYPE.WALL;
                }
            }
        }
        for (let y = room.offsetY + 2; y <= room.offsetY + room.height - 3; y++) {
            for (let x = room.offsetX + 2; x <= room.offsetX + room.width - 3; x++) {
                if (level[y][x].tileType === TILE_TYPE.NONE && Math.random() < 0.55) {
                    level[y][x].tile = new WallTile(x, y);
                    level[y][x].tileType = TILE_TYPE.WALL;
                }
            }
        }
    }
}