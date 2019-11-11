import {Game} from "./game"
import {redrawTiles} from "./draw";

export function centerCamera() {
    if (Game.player2.dead) centerCameraOnPlayer(Game.player);
    else if (Game.player.dead) centerCameraOnPlayer(Game.player2);
    else {
        centerCameraX(false);
        centerCameraY(false);
        scaleGameMap();
    }
}

export function centerCameraX(scale = true) {
    if (Game.player2.dead) centerCameraXOnPlayer(Game.player);
    else if (Game.player.dead) centerCameraXOnPlayer(Game.player2);
    else {
        Game.world.position.x = Game.APP.renderer.screen.width / 2 - (Game.player.position.x + (Game.player2.position.x - Game.player.position.x) / 2);
        if (scale) scaleGameMap();
    }
}

export function centerCameraY(scale = true) {
    if (Game.player2.dead) centerCameraYOnPlayer(Game.player);
    else if (Game.player.dead) centerCameraYOnPlayer(Game.player2);
    else {
        Game.world.position.y = Game.APP.renderer.screen.height / 2 - (Game.player.position.y + (Game.player2.position.y - Game.player.position.y) / 2);
        if (scale) scaleGameMap()
    }
}

export function centerCameraOnPlayer(player = Game.player) {
    centerCameraXOnPlayer(player);
    centerCameraYOnPlayer(player);
}

export function centerCameraXOnPlayer(player = Game.player) {
    Game.world.position.x = Game.APP.renderer.screen.width / 2 - player.position.x;
}

export function centerCameraYOnPlayer(player = Game.player) {
    Game.world.position.y = Game.APP.renderer.screen.height / 2 - player.position.y;
}

export function scaleGameMap() {
    //const limit = Game.TILESIZE * 2;
    if (!Game.player2.dead && !Game.player.dead) {
        const limit = 100;
        const canZoom = limit * 1.5;
        const gpx = Game.player.getGlobalPosition().x;
        const gpy = Game.player.getGlobalPosition().y;
        const gp2x = Game.player2.getGlobalPosition().x;
        const gp2y = Game.player2.getGlobalPosition().y;
        if (Game.APP.renderer.screen.width - gpx < limit || gpx < limit
            || Game.APP.renderer.screen.width - gp2x < limit || gp2x < limit
            || Game.APP.renderer.screen.height - gpy < limit || gpy < limit
            || Game.APP.renderer.screen.height - gp2y < limit || gp2y < limit) {
            Game.TILESIZE--;
            redrawTiles();
        } else if (Game.TILESIZE < Game.REFERENCE_TILESIZE &&
            ((Game.APP.renderer.screen.width - gpx > canZoom && gpx > canZoom
                && Game.APP.renderer.screen.height - gpy > canZoom && gpy > canZoom) ||
                (Game.APP.renderer.screen.width - gp2x > canZoom && gp2x > canZoom
                    && Game.APP.renderer.screen.height - gp2y > canZoom && gp2y > canZoom))) {
            Game.TILESIZE++;
            redrawTiles();
        }
    }
}

function newTileSizeOnStep(player, stepX = 0, stepY = 0) {
    //const limit = Game.TILESIZE * 2;
    const limit = 100;
    const canZoom = limit * 1.5;
    let otherPlayer;
    if (player === Game.player) otherPlayer = Game.player2;
    else otherPlayer = Game.player;
    const gpx = player.getGlobalPosition().x + stepX * Game.TILESIZE;
    const gpy = player.getGlobalPosition().y + stepY * Game.TILESIZE;
    const gp2x = otherPlayer.getGlobalPosition().x;
    const gp2y = otherPlayer.getGlobalPosition().y;
    if (Game.APP.renderer.screen.width - gpx < limit || gpx < limit
        || Game.APP.renderer.screen.width - gp2x < limit || gp2x < limit
        || Game.APP.renderer.screen.height - gpy < limit || gpy < limit
        || Game.APP.renderer.screen.height - gp2y < limit || gp2y < limit) {
        return Game.TILESIZE - 1;
    } else if (Game.TILESIZE < Game.REFERENCE_TILESIZE &&
        ((Game.APP.renderer.screen.width - gpx > canZoom && gpx > canZoom
            && Game.APP.renderer.screen.height - gpy > canZoom && gpy > canZoom) ||
            (Game.APP.renderer.screen.width - gp2x > canZoom && gp2x > canZoom
                && Game.APP.renderer.screen.height - gp2y > canZoom && gp2y > canZoom))) {
        return Game.TILESIZE + 1;
    }
    return Game.TILESIZE;
}