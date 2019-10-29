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
    GameState.gameLevel = level;

    //maybe they can trigger when you stand on entry but can't if you are one tile away from entry?... We'll see...
    GameState.levelGraphImpassableEntries = new Graph(level);
    for (let i = 0; i < GameState.levelGraphImpassableEntries.grid.length; ++i) {
        for (let j = 0; j < GameState.levelGraphImpassableEntries.grid[0].length; ++j) {
            if (GameState.levelGraphImpassableEntries.grid[i][j].weight === "v"
                || GameState.levelGraphImpassableEntries.grid[i][j].weight === "entry"
                || GameState.levelGraphImpassableEntries.grid[i][j].weight === "w") {
                GameState.levelGraphImpassableEntries.grid[i][j].weight = 0;
            } else {
                GameState.levelGraphImpassableEntries.grid[i][j].weight = 1;
            }
        }
    }

    GameState.levelGraph = getLevelPlayerGraph(level);

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

function generateMap(level) {
    let map = copy2dArray(level);
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
            else if (map[i][j] === "spi") mapCell.entity = new Spider(j, i);
            else if (map[i][j] === "spib") mapCell.entity = new SpiderB(j, i);
            else if (map[i][j] === "sna") mapCell.entity = new Snail(j, i);
            else if (map[i][j] === "snab") mapCell.entity = new SnailB(j, i);

            map[i][j] = mapCell;
        }
    }

    return map;
}