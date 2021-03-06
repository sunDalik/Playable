import {Game} from "../game";
import {randomChoice} from "./random_utils";
import {toDegrees, toRadians} from "./math_utils";

export function otherPlayer(player) {
    if (player === Game.player) return Game.player2;
    else if (player === Game.player2) return Game.player;
}

export function closestPlayer(entity) {
    if (Game.player.dead) return Game.player2;
    else if (Game.player2.dead) return Game.player;
    else if (tileDistance(Game.player, entity) === tileDistance(Game.player2, entity)) {
        return randomChoice([Game.player, Game.player2]);
    } else if (tileDistance(Game.player, entity) < tileDistance(Game.player2, entity)) {
        return Game.player;
    } else {
        return Game.player2;
    }
}

// use for enemies that can move diagonally
export function closestPlayerDiagonal(entity) {
    if (Game.player.dead) return Game.player2;
    else if (Game.player2.dead) return Game.player;
    else if (tileDistanceDiagonal(Game.player, entity, 1) === tileDistanceDiagonal(Game.player2, entity, 1)) {
        return randomChoice([Game.player, Game.player2]);
    } else if (tileDistanceDiagonal(Game.player, entity, 1) < tileDistanceDiagonal(Game.player2, entity, 1)) {
        return Game.player;
    } else {
        return Game.player2;
    }
}

export function tileDistance(a, b) {
    return Math.abs(a.tilePosition.x - b.tilePosition.x) + Math.abs(a.tilePosition.y - b.tilePosition.y);
}

//this is the method for objects of format {x: 0, y: 0}
// I'm not very proud of it ;)
export function pointTileDistance(a, b) {
    return tileDistance({tilePosition: {x: a.x, y: a.y}}, {tilePosition: {x: b.x, y: b.y}});
}

export function tileDistanceDiagonal(a, b, diagonalMultiplier = 1.5) {
    const tileDistX = Math.abs(a.tilePosition.x - b.tilePosition.x);
    const tileDistY = Math.abs(a.tilePosition.y - b.tilePosition.y);
    const diagonalTiles = Math.min(tileDistX, tileDistY);
    const cardinalTiles = Math.max(tileDistX, tileDistY) - diagonalTiles;
    return diagonalTiles * diagonalMultiplier + cardinalTiles;
}

export function distance(a, b) {
    return Math.sqrt(Math.pow(a.position.x - b.position.x, 2) + Math.pow(a.position.y - b.position.y, 2));
}

export function setTickTimeout(callback, tickTimeout, maxDelta = 99, pausable = true) {
    let counter = 0;
    const timeout = (delta) => {
        if (pausable && Game.paused) return;
        if (delta > maxDelta) delta = maxDelta;
        counter += delta;
        if (counter >= tickTimeout) {
            callback();
            Game.app.ticker.remove(timeout);
        }
    };
    Game.app.ticker.add(timeout);
    return timeout;
}

export function getEffectivePlayerCenter() {
    if (Game.player.dead) return {x: Game.player2.getTilePositionX(), y: Game.player2.getTilePositionY()};
    else if (Game.player2.dead) return {x: Game.player.getTilePositionX(), y: Game.player.getTilePositionY()};
    else return {
            x: Game.player.getTilePositionX() + (Game.player2.getTilePositionX() - Game.player.getTilePositionX()) / 2,
            y: Game.player.getTilePositionY() + (Game.player2.getTilePositionY() - Game.player.getTilePositionY()) / 2
        };
}

export function getTimeFromMs(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    ms -= seconds * 1000;
    seconds -= minutes * 60;
    return {minutes: minutes, seconds: seconds, ms: Math.floor(ms)};
}

// add angle if your image doesn't look to right
export function getAngleForDirection(direction, addAngle = 0) {
    let newAngle;
    if (direction.x === 0) {
        newAngle = Math.sign(direction.y) === 1 ? 90 : 270;
    } else {
        newAngle = toDegrees(Math.atan(direction.y / direction.x));
        if (direction.x <= 0) newAngle += 180;
    }
    return newAngle + addAngle;
}

export function getDirectionForAngle(angle) {
    const direction = {};
    angle = toRadians(-angle);
    const triangleSide = Math.min(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
    const hypotenuse = Math.sqrt(triangleSide ** 2 + 1);

    direction.x = Math.cos(angle) * hypotenuse;
    direction.y = -Math.sin(angle) * hypotenuse;
    return direction;
}