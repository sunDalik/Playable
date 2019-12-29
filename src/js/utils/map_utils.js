import {isAnyWallOrInanimate, isEmpty, isRelativelyEmpty} from "../map_checks";
import {Game} from "../game";

export function get8Directions() {
    return [{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
        {x: -1, y: 0}, {x: 1, y: 0},
        {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1}]
}

export function getCardinalDirections() {
    return [{x: 0, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}]
}

export function getHorizontalDirections() {
    return [{x: -1, y: 0}, {x: 1, y: 0}]
}

export function getRelativelyEmptyDirections(tileElement, givenDirections) {
    const directions = [];
    for (const dir of givenDirections) {
        if (isRelativelyEmpty(tileElement.tilePosition.x + dir.x, tileElement.tilePosition.y + dir.y)) {
            directions.push(dir);
        }
    }
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
    const directions = [];
    for (const dir of getHorizontalDirections()) {
        if (isRelativelyEmpty(tileElement.tilePosition.x + dir.x, tileElement.tilePosition.y + dir.y)) {
            directions.push(dir);
        }
    }
    return directions;
}

export function get8DirectionsWithoutItems(tileElement) {
    const directions = [];
    for (const dir of get8Directions()) {
        if (Game.map[tileElement.tilePosition.y + dir.y][tileElement.tilePosition.x + dir.x].item === null) {
            directions.push(dir);
        }
    }
    return directions;
}

export function getCardinalDirectionsWithoutItems(tileElement) {
    const directions = [];
    for (const dir of getCardinalDirections()) {
        if (Game.map[tileElement.tilePosition.y + dir.y][tileElement.tilePosition.x + dir.x].item === null) {
            directions.push(dir);
        }
    }
    return directions;
}

export function getCardinalDirectionsWithNoWallsOrInanimates(tileElement) {
    const directions = [];
    for (const dir of getCardinalDirections()) {
        if (!isAnyWallOrInanimate(tileElement.tilePosition.x + dir.x, tileElement.tilePosition.y + dir.y)) {
            directions.push(dir);
        }
    }
    return directions;
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

export function getChasingOptions(chaser, runner) {
    const directions = [];
    for (const dir of getChasingDirections(chaser, runner)) {
        if (isRelativelyEmpty(chaser.tilePosition.x + dir.x, chaser.tilePosition.y + dir.y)) {
            directions.push(dir);
        }
    }
    return directions;
}


export function getRunAwayOptions(runner, chaser) {
    const directions = [];
    for (const dir of getRunAwayDirections(runner, chaser)) {
        if (isRelativelyEmpty(runner.tilePosition.x + dir.x, runner.tilePosition.y + dir.y)) {
            directions.push(dir);
        }
    }
    return directions;
}

export function getEmptyRunAwayOptions(runner, chaser) {
    const directions = [];
    for (const dir of getRunAwayDirections(runner, chaser)) {
        if (isEmpty(runner.tilePosition.x + dir.x, runner.tilePosition.y + dir.y)) {
            directions.push(dir);
        }
    }
    return directions;
}