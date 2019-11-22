import {isRelativelyEmpty} from "../map_checks";
import {Game} from "../game";

export function get8Directions() {
    return [{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
        {x: -1, y: 0}, {x: 1, y: 0},
        {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1}]
}

export function getCardinalDirectionsWithNoHazards(tileElement) {
    let directions = [];
    for (const dir of getCardinalDirections()) {
        if (Game.map[tileElement.tilePosition.y + dir.y][tileElement.tilePosition.x + dir.x].hazard === null) {
            directions.push(dir);
        }
    }
    return directions;
}

export function getCardinalDirections() {
    return [{x: 0, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}]
}

export function getRelativelyEmptyCardinalDirections(tileElement) {
    let directions = [];
    for (const dir of getCardinalDirections()) {
        if (isRelativelyEmpty(tileElement.tilePosition.x + dir.x, tileElement.tilePosition.y + dir.y)) {
            directions.push(dir);
        }
    }
    return directions;
}

export function addHazardOrRefresh(hazard) {
    if (Game.map[hazard.tilePosition.y][hazard.tilePosition.x].hazard === null) {
        hazard.addToWorld();
        return hazard;
    } else {
        Game.map[hazard.tilePosition.y][hazard.tilePosition.x].hazard.refreshLifetime();
        return Game.map[hazard.tilePosition.y][hazard.tilePosition.x].hazard;
    }
}