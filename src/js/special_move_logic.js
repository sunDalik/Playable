import {isBullet, isEmpty, isEnemy, isNotOutOfMap} from "./map_checks";
import {Game} from "./game";
import {randomChoice} from "./utils/random_utils";
import {tileDistanceDiagonal} from "./utils/game_utils";
import {updateIntent} from "./game_logic";
import {DAMAGE_TYPE} from "./enums/damage_type";

export function castWind(origin, radius, blowDistance, atk = 1, crystal = false) {
    const slideTime = 2;
    for (let r = radius; r >= 0; r--) {
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                const tile = {x: origin.tilePosition.x + x, y: origin.tilePosition.y + y};
                if (Math.abs(x) + Math.abs(y) === r && isNotOutOfMap(tile.x, tile.y)) {
                    const hazard = Game.map[tile.y][tile.x].hazard;
                    if (hazard && crystal) {
                        hazard.removeFromWorld();
                    }
                    if (crystal && isBullet(tile.x, tile.y)) {
                        for (let i = Game.bullets.length - 1; i >= 0; i--) {
                            if (Game.bullets[i].tilePosition.x === tile.x && Game.bullets[i].tilePosition.y === tile.y) {
                                Game.bullets[i].die();
                            }
                        }
                    }
                    if (isEnemy(tile.x, tile.y)) {
                        const enemy = Game.map[tile.y][tile.x].entity;
                        enemy.addStun(2);
                        updateIntent(enemy);
                        const direction = {
                            x: Math.sign(enemy.tilePosition.x - origin.tilePosition.x),
                            y: Math.sign(enemy.tilePosition.y - origin.tilePosition.y)
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
                        let animationTime = slideTime * tileDistanceDiagonal({
                            tilePosition: {
                                x: newTilePosition.x,
                                y: newTilePosition.y
                            }
                        }, enemy);
                        //I dunno why it just doesnt look nice I dont know I honestly dont know
                        if (blowDistance === 1) animationTime++;
                        if (enemy.animation) enemy.cancelAnimation();
                        enemy.cancellable = false;
                        if (succeeded) {
                            enemy.slide(newTilePosition.x - enemy.tilePosition.x, newTilePosition.y - enemy.tilePosition.y, null, null, animationTime);
                        } else {
                            enemy.slide(newTilePosition.x - enemy.tilePosition.x, newTilePosition.y - enemy.tilePosition.y, null, () => {
                                enemy.slideBump(direction.x, direction.y, null, null, slideTime);
                                enemy.damage(origin, atk, direction.x, direction.y, DAMAGE_TYPE.MAGICAL);
                            }, animationTime);
                        }
                    }
                }
            }
        }
    }
}