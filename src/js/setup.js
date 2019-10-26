"use strict";

GameState.TILESIZE = 75;
GameState.gameMap = randomChoice(rooms);

GameState.enemies = [];
PIXI.utils.skipHello();
const app = initApplication();
GameState.APP = app;
GameState.loader = app.loader;
GameState.resources = app.loader.resources;
loadAll();

function initApplication() {
    let app = new PIXI.Application({resolution: window.devicePixelRatio});
    app.renderer.backgroundColor = 0xabcfd1;
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.view);
    return app
}


function loadProgressHandler(loader, resource) {
    console.log("Loading resource: " + resource.url);
    console.log("Progress: " + loader.progress + "%");
}

function setup() {
    GameState.player = new Player(GameState.resources["src/images/player.png"].texture, 7, 4);
    GameState.player.place();

    GameState.player2 = new Player(GameState.resources["src/images/player2.png"].texture, 12, 4);
    GameState.player2.place();

    GameState.gameMap[GameState.player.tilePosition.y][GameState.player.tilePosition.x] = "p1";
    GameState.gameMap[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x] = "p2";

    const grid = drawGrid();
    drawWalls();
    drawEnemies();
    displayInstructions();
    bindKeys();
    app.stage.addChild(GameState.player);
    app.stage.addChild(GameState.player2);
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