function centerCamera() {
    if (GameState.player2.dead) centerCameraOnPlayer(GameState.player);
    else if (GameState.player.dead) centerCameraOnPlayer(GameState.player2);
    else {
        centerCameraX(false);
        centerCameraY(false);
        scaleGameMap();
    }
}

function centerCameraX(scale = true) {
    if (GameState.player2.dead) centerCameraXOnPlayer(GameState.player);
    else if (GameState.player.dead) centerCameraXOnPlayer(GameState.player2);
    else {
        GameState.gameWorld.position.x = GameState.APP.renderer.screen.width / 2 - (GameState.player.position.x + (GameState.player2.position.x - GameState.player.position.x) / 2);
        if (scale) scaleGameMap();
    }
}

function centerCameraY(scale = true) {
    if (GameState.player2.dead) centerCameraYOnPlayer(GameState.player);
    else if (GameState.player.dead) centerCameraYOnPlayer(GameState.player2);
    else {
        GameState.gameWorld.position.y = GameState.APP.renderer.screen.height / 2 - (GameState.player.position.y + (GameState.player2.position.y - GameState.player.position.y) / 2);
        if (scale) scaleGameMap()
    }
}

function centerCameraOnPlayer(player = GameState.player) {
    centerCameraXOnPlayer(player);
    centerCameraYOnPlayer(player);
}

function centerCameraXOnPlayer(player = GameState.player) {
    GameState.gameWorld.position.x = GameState.APP.renderer.screen.width / 2 - player.position.x;
}

function centerCameraYOnPlayer(player = GameState.player) {
    GameState.gameWorld.position.y = GameState.APP.renderer.screen.height / 2 - player.position.y;
}

function scaleGameMap() {
    //const limit = GameState.TILESIZE * 2;
    if (!GameState.player2.dead && !GameState.player.dead) {
        const limit = 100;
        const canZoom = limit * 1.5;
        const gpx = GameState.player.getGlobalPosition().x;
        const gpy = GameState.player.getGlobalPosition().y;
        const gp2x = GameState.player2.getGlobalPosition().x;
        const gp2y = GameState.player2.getGlobalPosition().y;
        if (GameState.APP.renderer.screen.width - gpx < limit || gpx < limit
            || GameState.APP.renderer.screen.width - gp2x < limit || gp2x < limit
            || GameState.APP.renderer.screen.height - gpy < limit || gpy < limit
            || GameState.APP.renderer.screen.height - gp2y < limit || gp2y < limit) {
            GameState.TILESIZE--;
            redrawTiles();
        } else if (GameState.TILESIZE < GameState.REFERENCE_TILESIZE &&
            ((GameState.APP.renderer.screen.width - gpx > canZoom && gpx > canZoom
                && GameState.APP.renderer.screen.height - gpy > canZoom && gpy > canZoom) ||
                (GameState.APP.renderer.screen.width - gp2x > canZoom && gp2x > canZoom
                    && GameState.APP.renderer.screen.height - gp2y > canZoom && gp2y > canZoom))) {
            GameState.TILESIZE++;
            redrawTiles();
        }
    }
}

function newTileSizeOnStep(player, stepX = 0, stepY = 0) {
    //const limit = GameState.TILESIZE * 2;
    const limit = 100;
    const canZoom = limit * 1.5;
    let otherPlayer;
    if (player === GameState.player) otherPlayer = GameState.player2;
    else otherPlayer = GameState.player;
    const gpx = player.getGlobalPosition().x + stepX * GameState.TILESIZE;
    const gpy = player.getGlobalPosition().y + stepY * GameState.TILESIZE;
    const gp2x = otherPlayer.getGlobalPosition().x;
    const gp2y = otherPlayer.getGlobalPosition().y;
    if (GameState.APP.renderer.screen.width - gpx < limit || gpx < limit
        || GameState.APP.renderer.screen.width - gp2x < limit || gp2x < limit
        || GameState.APP.renderer.screen.height - gpy < limit || gpy < limit
        || GameState.APP.renderer.screen.height - gp2y < limit || gp2y < limit) {
        return GameState.TILESIZE - 1;
    } else if (GameState.TILESIZE < GameState.REFERENCE_TILESIZE &&
        ((GameState.APP.renderer.screen.width - gpx > canZoom && gpx > canZoom
            && GameState.APP.renderer.screen.height - gpy > canZoom && gpy > canZoom) ||
            (GameState.APP.renderer.screen.width - gp2x > canZoom && gp2x > canZoom
                && GameState.APP.renderer.screen.height - gp2y > canZoom && gp2y > canZoom))) {
        return GameState.TILESIZE + 1;
    }
    return GameState.TILESIZE;
}