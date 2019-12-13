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

export function setTickTimeout(callback, tickTimeout) {
    let counter = 0;
    const timeout = () => {
        counter++;
        if (counter >= tickTimeout) {
            callback();
            Game.app.ticker.remove(timeout);
        }
    };
    Game.app.ticker.add(timeout);
    return timeout;
}