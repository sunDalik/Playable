import {AnimatedTileElement} from "../tile_elements/animated_tile_element";
import {Game} from "../../game";
import {Z_INDEXES} from "../../z_indexing";
import {isEnemy} from "../../map_checks";
import {DAMAGE_TYPE} from "../../enums/damage_type";
import {randomShuffle} from "../../utils/random_utils";
import {pointTileDistance} from "../../utils/game_utils";

export class Minion extends AnimatedTileElement {
    constructor(texture) {
        super(texture, 1, 1);
        this.wielder = null;
        this.offset = {x: 1, y: 1};
        this.stepping = true;
        this.temporary = false;
        this.setOwnZIndex(Z_INDEXES.ENEMY + 1);
        this.attackedEnemies = [];
        this.hasShadow = true;
        this.removeShadow();
    }

    attack(summonItem) {
        if (!this.wielder) return;
        if (isEnemy(this.tilePosition.x, this.tilePosition.y)) {
            const enemy = Game.map[this.tilePosition.y][this.tilePosition.x].entity;
            const atk = this.wielder.getMinionAtk(summonItem);
            if (!this.attackedEnemies.includes(enemy)) {
                enemy.damage(this.wielder, atk, 0, 0, DAMAGE_TYPE.HAZARDAL);
                this.attackedEnemies.push(enemy);
                return true;
            }
        }
        return false;
    }

    resetAttackedEnemies() {
        this.attackedEnemies = [];
    }

    move() {
        if (!this.wielder) return;
        const stepDirection = this.getStepDirection();
        this.correctScale(stepDirection);
        if (this.stepping) {
            this.step(stepDirection.x, stepDirection.y, () => this.placeShadow());
        } else {
            this.slide(stepDirection.x, stepDirection.y, () => this.placeShadow());
        }
    }

    correctScale(stepDirection) {
        if (stepDirection.x !== 0) {
            this.scale.x = Math.abs(this.scale.x) * Math.sign(stepDirection.x);
        }
    }

    getStepDirection() {
        return {
            x: this.wielder.tilePosition.x - this.tilePosition.x + this.offset.x,
            y: this.wielder.tilePosition.y - this.tilePosition.y + this.offset.y
        };
    }

    correctTilePosition() {
        if (this.hasShadow) this.setShadow();
        this.setTilePosition(this.wielder.tilePosition.x + this.offset.x, this.wielder.tilePosition.y + this.offset.y);
    }

    activate(wielder, startingPoint = wielder.tilePosition) {
        this.wielder = wielder;
        this.offset = this.getOffset(startingPoint);
        if (this.offset) {
            Game.world.addChild(this);
            this.correctTilePosition();
        } else {
            this.deactivate();
        }
    }

    removeFromMap() {}

    placeOnMap() {}

    getOffset(startingPoint) {
        const freeSpot = this.findFreeSpot(startingPoint.x, startingPoint.y);
        if (!freeSpot) return null;
        return {x: freeSpot.x - this.wielder.tilePosition.x, y: freeSpot.y - this.wielder.tilePosition.y};
    }

    findFreeSpot(tileX, tileY) {
        //mostly stolen from dropItem()
        class Tile {
            constructor(x, y, sourceDirX, sourceDirY) {
                this.x = x;
                this.y = y;
                this.sourceDirX = sourceDirX;
                this.sourceDirY = sourceDirY;
            }
        }

        let currentTiles = [new Tile(tileX, tileY, 0, 0)];
        const badTiles = [];

        // stop searching if 12 tiles away. This is to prevent infinite recursion
        for (let i = 0; i < 12; i++) {
            const newTiles = [];

            for (const tile of currentTiles) {
                if (badTiles.some(t => t.x === tile.x && t.y === tile.y)) continue;
                badTiles.push(tile);
                if (pointTileDistance(this.wielder.tilePosition, tile) > 6) continue;

                if (!this.areAnyMinions(tile.x, tile.y) && (tile.x !== this.wielder.tilePosition.x || tile.y !== this.wielder.tilePosition.y)) {
                    return {x: tile.x, y: tile.y};
                } else {
                    if (tile.sourceDirX === 0 && tile.sourceDirY === 0) {
                        newTiles.push(new Tile(tile.x + 1, tile.y, -1, 0));
                        newTiles.push(new Tile(tile.x - 1, tile.y, 1, 0));
                        newTiles.push(new Tile(tile.x, tile.y + 1, 0, -1));
                        newTiles.push(new Tile(tile.x, tile.y - 1, 0, 1));
                    } else {
                        if (tile.sourceDirY === 0) {
                            newTiles.push(new Tile(tile.x, tile.y - 1, tile.sourceDirX, 1));
                            newTiles.push(new Tile(tile.x, tile.y + 1, tile.sourceDirX, -1));
                        } else {
                            newTiles.push(new Tile(tile.x, tile.y - tile.sourceDirY, tile.sourceDirX, tile.sourceDirY));
                        }
                        if (tile.sourceDirX === 0) {
                            newTiles.push(new Tile(tile.x - 1, tile.y, 1, tile.sourceDirY));
                            newTiles.push(new Tile(tile.x + 1, tile.y, -1, tile.sourceDirY));
                        } else {
                            newTiles.push(new Tile(tile.x - tile.sourceDirX, tile.y, tile.sourceDirX, tile.sourceDirY));
                        }
                    }
                }
            }

            currentTiles = randomShuffle(newTiles);
        }

        return null;
    }

    // destroys temporary minions O_O
    areAnyMinions(tileX, tileY) {
        for (const item of this.wielder.getEquipment()) {
            if (item && item.minions) {
                for (const minion of item.minions) {
                    if (minion === this) continue;
                    if (minion.tilePosition.x === tileX && minion.tilePosition.y === tileY) {
                        if (minion.temporary && !this.temporary) {
                            minion.die(item);
                            return false;
                        } else {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    deactivate() {
        Game.world.removeChild(this);
        this.wielder = null;
        this.removeShadow();
    }

    // permanent minions don't die
    die() {
    }
}