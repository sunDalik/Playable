import {closestPlayer, tileDistance} from "./utils/game_utils";
import {
    getDirectionsWithConditions,
    getEmptyCardinalDirections,
    getEmptyRunAwayOptions,
    getRelativelyEmptyCardinalDirections
} from "./utils/map_utils";
import {randomChoice} from "./utils/random_utils";
import {getPlayerOnTile, isEmpty} from "./map_checks";

export function randomAfraidAI(enemy, fearDistance = 2, panicDamage = true, slide = false) {
    let movementOptions;
    const getMoveDirections = panicDamage ? getRelativelyEmptyCardinalDirections : getEmptyCardinalDirections;
    if (tileDistance(enemy, closestPlayer(enemy)) <= fearDistance) {
        movementOptions = getEmptyRunAwayOptions(enemy, closestPlayer(enemy));
        if (movementOptions.length === 0) movementOptions = getMoveDirections(enemy);
    } else movementOptions = getMoveDirections(enemy);
    if (movementOptions.length !== 0) {
        const moveDir = randomChoice(movementOptions);
        if (moveDir.x !== 0 && Math.sign(moveDir.x) !== Math.sign(enemy.scale.x)) {
            enemy.scale.x *= -1;
        }
        moveEnemyInDirection(enemy, moveDir, slide);
        enemy.currentTurnDelay = enemy.turnDelay;
    }
}

export function moveEnemyInDirection(enemy, direction, slide = false) {
    if (isEmpty(enemy.tilePosition.x + direction.x, enemy.tilePosition.y + direction.y)) {
        if (slide) enemy.slide(direction.x, direction.y);
        else enemy.step(direction.x, direction.y);
    } else {
        if (slide) enemy.slideBump(direction.x, direction.y);
        else enemy.bump(direction.x, direction.y);

        const player = getPlayerOnTile(enemy.tilePosition.x + direction.x, enemy.tilePosition.y + direction.y);
        if (player) {
            player.damage(enemy.atk, enemy);
            if (enemy.healOnHit) enemy.heal(enemy.healOnHit);
        }
    }
}

//not sure if I will reuse it yet...
export function soldierAI(enemy, player = closestPlayer(enemy)) {
    const forward = {x: Math.sign(player.tilePosition.x - enemy.tilePosition.x), y: 0};
    const align = {x: 0, y: Math.sign(player.tilePosition.y - enemy.tilePosition.y)};
    if (enemy.tilePosition.y === player.tilePosition.y) {
        const directions = [forward];
        if (tileDistance(enemy, player) > 2) {
            directions.push(forward);
            directions.push({x: 0, y: 1});
            directions.push({x: 0, y: -1});
            directions.push({x: -forward.x, y: 0});
        } else if (tileDistance(enemy, player) === 2) {
            if (player.lastTileStepX === -forward.x && isEmpty(enemy.tilePosition.x - forward.x, enemy.tilePosition.y)) {
                directions.push({x: -forward.x, y: 0});
            } else if (!isEmpty(enemy.tilePosition.x + forward.x, enemy.tilePosition.y + forward.y)) {
                directions.push({x: 0, y: 1});
                directions.push({x: 0, y: -1});
            }
        } else if (tileDistance(enemy, player) === 1) {
            directions.push({x: 0, y: 1});
            directions.push({x: 0, y: -1});
        }
        const direction = randomChoice(getDirectionsWithConditions(enemy, directions, isEmpty));
        if (direction !== undefined) {
            enemy.step(direction.x, direction.y);
        }
    } else {
        const directions = [align, align, forward];
        const direction = randomChoice(getDirectionsWithConditions(enemy, directions, isEmpty));
        if (direction !== undefined) {
            enemy.step(direction.x, direction.y);
        }
    }
}