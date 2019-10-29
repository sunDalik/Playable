"use strict";

PIXI.utils.skipHello();
const app = initApplication();
GameState.APP = app;
GameState.loader = app.loader;
GameState.resources = app.loader.resources;
loadAll();

function initApplication() {
    let app = new PIXI.Application({resolution: window.devicePixelRatio});
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.view);
    return app
}

function loadProgressHandler(loader, resource) {
    //console.log("Loading resource: " + resource.url);
    //console.log("Progress: " + loader.progress + "%");
}

window.addEventListener("resize", () => {
    GameState.APP.renderer.resize(window.innerWidth, window.innerHeight);
    centerCamera();
});

function setup() {
    let level = generateLevel();
    let player1StartTileX, player1StartTileY;
    loop: for (let i = 0; i < level.length; ++i) {
        for (let j = 0; j < level[0].length; ++j) {
            if (level[i][j] === "") {
                player1StartTileX = j;
                player1StartTileY = i;
                break loop;
            }
        }
    }

    GameState.gameWorld = new PIXI.Container();
    GameState.APP.stage.addChild(GameState.gameWorld);
    GameState.HUD = new PIXI.Container();
    GameState.APP.stage.addChild(GameState.HUD);

    GameState.gameMap = generateMap(level);

    GameState.player = new Player(GameState.resources["src/images/player.png"].texture, player1StartTileX, player1StartTileY);
    GameState.player2 = new Player(GameState.resources["src/images/player2.png"].texture, player1StartTileX, player1StartTileY + 1);
    GameState.gameMap[GameState.player.tilePosition.y][GameState.player.tilePosition.x].entity = GameState.player;
    GameState.gameMap[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x].entity = GameState.player2;
    GameState.tiles.push(GameState.player);
    GameState.tiles.push(GameState.player2);

    GameState.grid = drawGrid();
    drawWalls();
    drawVoids();
    displayInstructions();
    drawEnemies();
    bindKeys();
    GameState.player2.zIndex = GameState.player.zIndex + 1;
    GameState.gameWorld.addChild(GameState.player);
    GameState.gameWorld.addChild(GameState.player2);
    GameState.gameWorld.sortableChildren = true;
    GameState.APP.stage.sortableChildren = true;
    centerCamera();
    drawOther();
}

function centerCamera() {
    centerCameraX(false);
    centerCameraY(false);
    scaleGameMap();
}

function centerCameraX(scale = true) {
    GameState.gameWorld.position.x = GameState.APP.renderer.screen.width / 2 - (GameState.player.position.x + (GameState.player2.position.x - GameState.player.position.x) / 2);
    if (scale) scaleGameMap();
}

function centerCameraY(scale = true) {
    GameState.gameWorld.position.y = GameState.APP.renderer.screen.height / 2 - (GameState.player.position.y + (GameState.player2.position.y - GameState.player.position.y) / 2);
    if (scale) scaleGameMap()
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

function newTileSizeOnStep(player, stepX = 0, stepY = 0) {
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

function bindKeys() {
    bindMovement(GameState.player, {upCode: 87, leftCode: 65, downCode: 83, rightCode: 68});
    bindMovement(GameState.player2, {upCode: 38, leftCode: 37, downCode: 40, rightCode: 39});

    const fireKey = keyboard(70);
    fireKey.press = () => {
        playerTurn(null, fireball, true)
    };

    const teleportKey = keyboard(84);
    teleportKey.press = () => {
        playerTurn(GameState.player2, teleport)
    };

    const rotateKey = keyboard(82);
    rotateKey.press = () => {
        playerTurn(GameState.player, rotateAttack)
    };

    const crossKey = keyboard(67);
    crossKey.press = () => {
        playerTurn(GameState.player2, crossAttack)
    };

    const switchKey = keyboard(17);
    switchKey.press = () => {
        playerTurn(null, switchPlayers, true)
    };
}

function bindMovement(player, {upCode, leftCode, downCode, rightCode}) {
    const upKey = keyboard(upCode);
    const leftKey = keyboard(leftCode);
    const downKey = keyboard(downCode);
    const rightKey = keyboard(rightCode);
    upKey.press = () => {
        playerTurn(player, () => movePlayer(player, 0, -1));
    };
    leftKey.press = () => {
        playerTurn(player, () => movePlayer(player, -1, 0));
    };
    downKey.press = () => {
        playerTurn(player, () => movePlayer(player, 0, 1));

    };
    rightKey.press = () => {
        playerTurn(player, () => movePlayer(player, 1, 0));
    };
    return {upKey: upKey, leftKey: leftKey, downKey: downKey, rightKey: rightKey}
}

function generateMap(map) {
    for (let i = 0; i < map.length; ++i) {
        for (let j = 0; j < map[0].length; ++j) {
            let mapCell = {
                wall: false,
                hazard: null,
                entity: null,
                void: false
            };
            if (map[i][j] === "w") mapCell.wall = true;
            if (map[i][j] === "v") mapCell.void = true;

            if (map[i][j] === "r") mapCell.entity = new Roller(j, i);
            else if (map[i][j] === "rb") mapCell.entity = new RollerB(j, i);
            else if (map[i][j] === "s") mapCell.entity = new Star(j, i);
            else if (map[i][j] === "sb") mapCell.entity = new StarB(j, i);

            map[i][j] = mapCell;
        }
    }

    return map;
}