import {isNotAWall} from "../map_checks";

export function get8Directions() {
    return [{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
        {x: -1, y: 0}, {x: 1, y: 0},
        {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1}]
}

export function getCardinalDirections() {
    return [{x: 0, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}]
}

export function getNonWallCardinalDirections(tileElement) {
    let directions = [];
    for (const dir of getCardinalDirections()) {
        if (isNotAWall(tileElement.tilePosition.x + dir.x, tileElement.tilePosition.y + dir.y)) {
            directions.push(dir);
        }
    }
    return directions;
}