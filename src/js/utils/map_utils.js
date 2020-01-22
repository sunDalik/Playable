import {isAnyWallOrInanimate, isEmpty, isRelativelyEmpty} from "../map_checks";
import {Game} from "../game";

export function get8Directions() {
    return [{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
        {x: -1, y: 0}, {x: 1, y: 0},
        {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1}]
}

export function get8DirectionsInRadius(radius, excludeZero = true) {
    const directions = [];
    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            if (x === 0 && y === 0 && excludeZero) continue;
            directions.push({x: x, y: y});
        }
    }
    return directions;
}

export function getCardinalDirections() {
    return [{x: 0, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}]
}

export function getHorizontalDirections() {
    return [{x: -1, y: 0}, {x: 1, y: 0}]
}

export function getChasingDirections(chaser, runner) {
    if (chaser.tilePosition.x === runner.tilePosition.x || chaser.tilePosition.y === runner.tilePosition.y) {
        return [{
            x: Math.sign(runner.tilePosition.x - chaser.tilePosition.x),
            y: Math.sign(runner.tilePosition.y - chaser.tilePosition.y)
        }];
    } else {
        return [
            {x: Math.sign(runner.tilePosition.x - chaser.tilePosition.x), y: 0},
            {x: 0, y: Math.sign(runner.tilePosition.y - chaser.tilePosition.y)}
        ];
    }
}

export function getRunAwayDirections(runner, chaser) {
    let directions = [];
    if (chaser.tilePosition.x === runner.tilePosition.x) {
        directions.push({x: -1, y: 0});
        directions.push({x: 1, y: 0});
    } else directions.push({x: Math.sign(runner.tilePosition.x - chaser.tilePosition.x), y: 0});
    if (chaser.tilePosition.y === runner.tilePosition.y) {
        directions.push({x: 0, y: -1});
        directions.push({x: 0, y: 1});
    } else directions.push({x: 0, y: Math.sign(runner.tilePosition.y - chaser.tilePosition.y)});
    return directions;
}

export function getRelativelyEmptyCardinalDirections(tileElement, range = 1) {
    const directions = [];
    for (const dir of getCardinalDirections()) {
        if (isRelativelyEmpty(tileElement.tilePosition.x + dir.x * range, tileElement.tilePosition.y + dir.y * range)) {
            directions.push({x: dir.x * range, y: dir.y * range});
        }
    }
    return directions;
}

export function getRelativelyEmptyHorizontalDirections(tileElement) {
    return getDirectionsWithConditions(tileElement, getHorizontalDirections(), isRelativelyEmpty);
}

export function get8DirectionsWithoutItems(tileElement) {
    return getDirectionsWithConditions(tileElement, get8Directions(),
        (tilePosX, tilePosY) => Game.map[tilePosY][tilePosX].item === null);
}

export function getCardinalDirectionsWithoutItems(tileElement) {
    return getDirectionsWithConditions(tileElement, getCardinalDirections(),
        (tilePosX, tilePosY) => Game.map[tilePosY][tilePosX].item === null);
}

export function getCardinalDirectionsWithNoWallsOrInanimates(tileElement) {
    return getDirectionsWithConditions(tileElement, getCardinalDirections(), (...args) => !isAnyWallOrInanimate(...args));
}

export function getChasingOptions(chaser, runner) {
    return getDirectionsWithConditions(chaser, getChasingDirections(chaser, runner), isRelativelyEmpty);
}

export function getRunAwayOptions(runner, chaser) {
    return getDirectionsWithConditions(runner, getRunAwayDirections(runner, chaser), isRelativelyEmpty);
}

export function getEmptyRunAwayOptions(runner, chaser) {
    return getDirectionsWithConditions(runner, getRunAwayDirections(runner, chaser), isEmpty);
}

/**
 * Checks all the directions for given conditions and returns only valid ones.
 * @param entity        entity that has tilePosition
 * @param directions    array that looks like this [{x: 0, y: 0}, {x: 1, y: 0}...]
 * @param conditions    condition is a function that accepts (tilePosX, tilePosY) and returns true/false
 * @returns {[]}        valid directions for given entity with given conditions
 */
export function getDirectionsWithConditions(entity, directions, ...conditions) {
    const validDirections = [];
    for (const dir of directions) {
        if (conditions.reduce((acc, condition) => acc && condition(entity.tilePosition.x + dir.x, entity.tilePosition.y + dir.y), true)) {
            validDirections.push(dir);
        }
    }
    return validDirections;
}