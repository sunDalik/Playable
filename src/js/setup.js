"use strict";

PIXI.utils.skipHello();
const app = initApplication();
Game.APP = app;
Game.loader = app.loader;
Game.resources = app.loader.resources;
loadAll();

function initApplication() {
    let app = new PIXI.Application({resolution: window.devicePixelRatio});
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resolution = 2;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.view);
    return app
}

function loadProgressHandler(loader, resource) {
    //console.log("Loading resource: " + resource.url);
    //console.log("Progress: " + loader.progress + "%");
}

window.addEventListener("resize", () => {
    Game.APP.renderer.resize(window.innerWidth, window.innerHeight);
    drawHUD();
    centerCamera();
});

function setup() {
    let level = generateLevel();
    Game.gameWorld = new PIXI.Container();
    Game.APP.stage.addChild(Game.gameWorld);

    Game.HUD = new PIXI.Container();
    Game.HEARTS1 = new PIXI.Container();
    Game.HEARTS2 = new PIXI.Container();
    Game.SLOTS1 = new PIXI.Container();
    Game.SLOTS2 = new PIXI.Container();
    Game.HUD.addChild(Game.HEARTS1);
    Game.HUD.addChild(Game.HEARTS2);
    Game.HUD.addChild(Game.SLOTS1);
    Game.HUD.addChild(Game.SLOTS2);
    Game.APP.stage.addChild(Game.HUD);

    Game.gameMap = generateMap(level);
    Game.gameLevel = level;

    Game.playerDetectionGraph = new Graph(level);
    for (let i = 0; i < Game.playerDetectionGraph.grid.length; ++i) {
        for (let j = 0; j < Game.playerDetectionGraph.grid[0].length; ++j) {
            if (Game.playerDetectionGraph.grid[i][j].weight === "v"
                || Game.playerDetectionGraph.grid[i][j].weight === "path"
                || Game.playerDetectionGraph.grid[i][j].weight === "w") {
                Game.playerDetectionGraph.grid[i][j].weight = 0;
            } else {
                Game.playerDetectionGraph.grid[i][j].weight = 1;
            }
        }
    }

    Game.levelGraph = getLevelPlayerGraph(level);

    Game.player = new Player(Game.resources["src/images/player.png"].texture, Game.startX, Game.startY);
    Game.player2 = new Player(Game.resources["src/images/player2.png"].texture, Game.startX + 1, Game.startY + 1);
    Game.gameMap[Game.player.tilePosition.y][Game.player.tilePosition.x].entity = Game.player;
    Game.gameMap[Game.player2.tilePosition.y][Game.player2.tilePosition.x].entity = Game.player2;
    Game.player.setStats(1, 0.5, 0, 1.5);
    Game.player2.setStats(1, 1.5, 0, 0.5);
    Game.player2.weapon = new Sword();
    Game.player.armor = new BasicArmor();

    Game.grid = drawGrid();
    drawWalls();
    //drawVoids();
    createDarkness();
    lightPlayerPosition(Game.player);
    lightPlayerPosition(Game.player2);
    drawHUD();
    drawEntities();
    bindKeys();
    Game.player.zIndex = Game.player2.zIndex + 1;
    Game.primaryPlayer = Game.player;
    Game.gameWorld.sortableChildren = true;
    Game.APP.stage.sortableChildren = true;
    Game.SLOTS1.sortableChildren = true;
    Game.SLOTS2.sortableChildren = true;
    centerCamera();
    drawOther();
}

function bindKeys() {
    bindMovement(Game.player, {upCode: 87, leftCode: 65, downCode: 83, rightCode: 68});
    bindMovement(Game.player2, {upCode: 38, leftCode: 37, downCode: 40, rightCode: 39});

    const fireKey = keyboard(70);
    fireKey.press = () => {
        playerTurn(null, fireball, true)
    };

    const teleportKey = keyboard(84);
    teleportKey.press = () => {
        playerTurn(Game.player2, teleport)
    };

    const rotateKey = keyboard(82);
    rotateKey.press = () => {
        playerTurn(Game.player, rotateAttack)
    };

    const crossKey = keyboard(67);
    crossKey.press = () => {
        playerTurn(Game.player2, crossAttack)
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
    upKey.press = (e) => {
        playerTurn(player, () => player.move(0, -1, e));
    };
    leftKey.press = (e) => {
        playerTurn(player, () => player.move(-1, 0, e));
    };
    downKey.press = (e) => {
        playerTurn(player, () => player.move(0, 1, e));

    };
    rightKey.press = (e) => {
        playerTurn(player, () => player.move(1, 0, e));
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
                secondaryEntity: null,
                lit: false
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
            else if (map[i][j] === "statue") mapCell.entity = new Statue(j, i, getRandomWeapon());

            map[i][j] = mapCell;
        }
    }

    return map;
}