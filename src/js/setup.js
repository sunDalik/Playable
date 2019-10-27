"use strict";

GameState.TILESIZE = 75;

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
    //console.log("Loading resource: " + resource.url);
    //console.log("Progress: " + loader.progress + "%");
}

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

    GameState.gameMap = generateMap(level);

    GameState.player = new Player(GameState.resources["src/images/player.png"].texture, player1StartTileX, player1StartTileY);
    GameState.player.place();

    GameState.player2 = new Player(GameState.resources["src/images/player2.png"].texture, player1StartTileX, player1StartTileY + 1);
    GameState.player2.place();

    GameState.gameMap[GameState.player.tilePosition.y][GameState.player.tilePosition.x].entity = GameState.player;
    GameState.gameMap[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x].entity = GameState.player2;

    const grid = drawGrid();
    drawWalls();
    drawVoids();
    drawEnemies();
    displayInstructions();
    bindKeys();
    GameState.player.zIndex = 1000;
    GameState.player2.zIndex = GameState.player.zIndex + 1;
    GameState.APP.stage.addChild(GameState.player);
    GameState.APP.stage.addChild(GameState.player2);
    GameState.APP.stage.sortableChildren = true;
    centerCameraOnPlayer(GameState.player);
}

function centerCameraOnPlayer(player) {
    GameState.APP.stage.position.x += GameState.APP.renderer.screen.width / 2 - player.position.x;
    GameState.APP.stage.position.y += GameState.APP.renderer.screen.height / 2 - player.position.y;
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

            if (map[i][j] === "r") mapCell.entity = new Roller(j, i);
            else if (map[i][j] === "rb") mapCell.entity = new RollerB(j, i);
            else if (map[i][j] === "s") mapCell.entity = new Star(j, i);
            else if (map[i][j] === "sb") mapCell.entity = new StarB(j, i);

            if (map[i][j] === "v") mapCell.void = true;

            map[i][j] = mapCell;
        }
    }

    return map;
}