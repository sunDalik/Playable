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
    drawHUD();
    centerCamera();
});

function setup() {
    let level = generateLevel();
    GameState.gameWorld = new PIXI.Container();
    GameState.APP.stage.addChild(GameState.gameWorld);
    GameState.HUD = new PIXI.Container();
    GameState.HEARTS1 = new PIXI.Container();
    GameState.HEARTS2 = new PIXI.Container();
    GameState.APP.stage.addChild(GameState.HUD);
    GameState.HUD.addChild(GameState.HEARTS1);
    GameState.HUD.addChild(GameState.HEARTS2);

    GameState.gameMap = generateMap(level);
    GameState.gameLevel = level;

    GameState.playerDetectionGraph = new Graph(level);
    for (let i = 0; i < GameState.playerDetectionGraph.grid.length; ++i) {
        for (let j = 0; j < GameState.playerDetectionGraph.grid[0].length; ++j) {
            if (GameState.playerDetectionGraph.grid[i][j].weight === "v"
                || GameState.playerDetectionGraph.grid[i][j].weight === "path"
                || GameState.playerDetectionGraph.grid[i][j].weight === "w") {
                GameState.playerDetectionGraph.grid[i][j].weight = 0;
            } else {
                GameState.playerDetectionGraph.grid[i][j].weight = 1;
            }
        }
    }

    GameState.levelGraph = getLevelPlayerGraph(level);

    GameState.player = new Player(GameState.resources["src/images/player.png"].texture, GameState.startX, GameState.startY);
    GameState.player2 = new Player(GameState.resources["src/images/player2.png"].texture, GameState.startX + 1, GameState.startY + 1);
    GameState.gameMap[GameState.player.tilePosition.y][GameState.player.tilePosition.x].entity = GameState.player;
    GameState.gameMap[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x].entity = GameState.player2;
    GameState.tiles.push(GameState.player);
    GameState.tiles.push(GameState.player2);
    GameState.player.setStats(1, 0.5, 0, 1.5);
    GameState.player2.setStats(1, 1.5, 0, 0.5);

    GameState.grid = drawGrid();
    drawWalls();
    drawVoids();
    //displayInstructions();
    drawHUD();
    drawEnemies();
    bindKeys();
    GameState.player2.zIndex = GameState.player.zIndex + 1;
    GameState.primaryPlayer = GameState.player2;
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
                tileType: TILE_TYPE.NONE,
                hazard: null,
                entity: null,
                secondaryEntity: null
            };
            if (map[i][j] === "w") mapCell.tileType = TILE_TYPE.WALL;
            else if (map[i][j] === "v") mapCell.tileType = TILE_TYPE.VOID;
            else if (map[i][j] === "entry") mapCell.tileType = TILE_TYPE.ENTRY;
            else if (map[i][j] === "path") mapCell.tileType = TILE_TYPE.PATH;

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