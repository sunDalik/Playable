import {Game} from "./game"
import {drawGrid, drawOther} from "./drawing/draw_init";

export function centerCamera() {
    if (Game.player2.dead) centerCameraOnPlayer(Game.player);
    else if (Game.player.dead) centerCameraOnPlayer(Game.player2);
    else {
        centerCameraX();
        centerCameraY();
    }
}

export function centerCameraX() {
    if (Game.player2.dead) centerCameraXOnPlayer(Game.player);
    else if (Game.player.dead) centerCameraXOnPlayer(Game.player2);
    else {
        Game.world.position.x = Game.app.renderer.screen.width / 2 - (Game.player.position.x + (Game.player2.position.x - Game.player.position.x) / 2);
    }
}

export function centerCameraY() {
    if (Game.player2.dead) centerCameraYOnPlayer(Game.player);
    else if (Game.player.dead) centerCameraYOnPlayer(Game.player2);
    else {
        Game.world.position.y = Game.app.renderer.screen.height / 2 - (Game.player.position.y + (Game.player2.position.y - Game.player.position.y) / 2);
    }
}

export function centerCameraOnPlayer(player) {
    centerCameraXOnPlayer(player);
    centerCameraYOnPlayer(player);
}

export function centerCameraXOnPlayer(player) {
    Game.world.position.x = Game.app.renderer.screen.width / 2 - player.position.x;
}

export function centerCameraYOnPlayer(player = Game.player) {
    Game.world.position.y = Game.app.renderer.screen.height / 2 - player.position.y;
}

export function scaleGameMap() {
    return;
    //const limit = Game.TILESIZE * 2;
    if (!Game.player2.dead && !Game.player.dead) {
        const limit = 100;
        const canZoom = limit * 1.5;
        const gp = Game.player.getGlobalPosition();
        const gp2 = Game.player2.getGlobalPosition();
        if (Game.app.renderer.screen.width - gp.x < limit || gp.x < limit
            || Game.app.renderer.screen.width - gp2.x < limit || gp2.x < limit
            || Game.app.renderer.screen.height - gp.y < limit || gp.y < limit
            || Game.app.renderer.screen.height - gp2.y < limit || gp2.y < limit) {
            Game.TILESIZE -= 5;
            redrawTiles();
        } else if (Game.TILESIZE < Game.REFERENCE_TILESIZE &&
            ((Game.app.renderer.screen.width - gp.x > canZoom && gp.x > canZoom
                && Game.app.renderer.screen.height - gp.y > canZoom && gp.y > canZoom) ||
                (Game.app.renderer.screen.width - gp2.x > canZoom && gp2.x > canZoom
                    && Game.app.renderer.screen.height - gp2.y > canZoom && gp2.y > canZoom))) {
            Game.TILESIZE += 5;
            redrawTiles();
        }
    }
}

export function redrawTiles() {
    Game.world.removeChild(Game.grid);
    Game.grid = drawGrid();
    for (const graphic of Game.otherGraphics) {
        Game.world.removeChild(graphic);
    }
    Game.otherGraphics = [];

    for (const enemy of Game.enemies) {
        if (!enemy.dead) enemy.redrawHealth();
    }

    for (const tile of Game.tiles) {
        tile.fitToTile();
        tile.place();
    }

    for (const hazard of Game.hazards) {
        hazard.fitToTile();
        hazard.place();
    }

    drawOther();
    centerCamera()
}