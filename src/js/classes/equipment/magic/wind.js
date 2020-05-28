import {Game} from "../../../game";
import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {isBullet, isEmpty, isEnemy, isNotOutOfMap} from "../../../map_checks";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {randomChoice} from "../../../utils/random_utils";
import {tileDistanceDiagonal} from "../../../utils/game_utils";

export class Wind extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_wind.png"];
        this.type = MAGIC_TYPE.WIND;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.radius = 3;
        this.crystal = false;
        this.slideTime = 2;
        this.atk = 1;
        this.uses = this.maxUses = 5;
        this.name = "Wind";
        this.description = "EDIT";
        this.calculateRarity();
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        const blowDistance = 2;
        for (let r = this.radius; r >= 0; r--) {
            for (let x = -this.radius; x <= this.radius; x++) {
                for (let y = -this.radius; y <= this.radius; y++) {
                    const tile = {x: wielder.tilePosition.x + x, y: wielder.tilePosition.y + y};
                    if (Math.abs(x) + Math.abs(y) === r && isNotOutOfMap(tile.x, tile.y)) {
                        const hazard = Game.map[tile.y][tile.x].hazard;
                        if (hazard && this.crystal) {
                            hazard.removeFromWorld();
                        }
                        if (this.crystal && isBullet(x, y)) {
                            for (let i = Game.bullets.length - 1; i >= 0; i--) {
                                if (Game.bullets[i].tilePosition.x === tile.x && Game.bullets[i].tilePosition.y === tile.y) {
                                    Game.bullets[i].die();
                                }
                            }
                        }
                        if (isEnemy(tile.x, tile.y)) {
                            const enemy = Game.map[tile.y][tile.x].entity;
                            enemy.stun += 2;
                            const direction = {
                                x: Math.sign(enemy.tilePosition.x - wielder.tilePosition.x),
                                y: Math.sign(enemy.tilePosition.y - wielder.tilePosition.y)
                            };
                            if (direction.x === 0) direction.x = randomChoice([-1, 1]);
                            if (direction.y === 0) direction.y = randomChoice([-1, 1]);
                            let newTilePosition = {x: enemy.tilePosition.x, y: enemy.tilePosition.y};
                            let succeeded = false;
                            for (let i = 0; i < blowDistance; i++) {
                                succeeded = false;
                                for (const dir of [direction, {x: direction.x, y: 0}, {x: 0, y: direction.y}]) {
                                    if (isEmpty(newTilePosition.x + dir.x, newTilePosition.y + dir.y)) {
                                        succeeded = true;
                                        newTilePosition.x += dir.x;
                                        newTilePosition.y += dir.y;
                                        break;
                                    }
                                }
                                if (!succeeded) {
                                    break;
                                }
                            }
                            const animationTime = this.slideTime * tileDistanceDiagonal({
                                tilePosition: {
                                    x: newTilePosition.x,
                                    y: newTilePosition.y
                                }
                            }, enemy);
                            if (succeeded) {
                                enemy.slide(newTilePosition.x - enemy.tilePosition.x, newTilePosition.y - enemy.tilePosition.y, null, null, animationTime);
                            } else {
                                enemy.slide(newTilePosition.x - enemy.tilePosition.x, newTilePosition.y - enemy.tilePosition.y, null, () => {
                                    enemy.slideBump(direction.x, direction.y, null, null, this.slideTime);
                                    enemy.damage(wielder, this.atk, direction.x, direction.y, true);
                                }, animationTime);
                            }
                        }
                    }
                }
            }
        }
        this.uses--;
        return true;
    }
}