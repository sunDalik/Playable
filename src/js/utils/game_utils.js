import {Game} from "../game";
import {randomChoice} from "./random_utils";

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

export function tileDistance(a, b) {
    return Math.abs(a.tilePosition.x - b.tilePosition.x) + Math.abs(a.tilePosition.y - b.tilePosition.y);
}

export function tileDistanceDiagonal(a, b) {
    const tileDistX = Math.abs(a.tilePosition.x - b.tilePosition.x);
    const tileDistY = Math.abs(a.tilePosition.y - b.tilePosition.y);
    const diagonalTiles = Math.min(tileDistX, tileDistY);
    const cardinalTiles = Math.max(tileDistX, tileDistY) - diagonalTiles;
    return diagonalTiles * 1.5 + cardinalTiles;
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