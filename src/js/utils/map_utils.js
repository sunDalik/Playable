import {isRelativelyEmpty} from "../map_checks";
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